import os
import praw
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import time
from dotenv import load_dotenv
from groq import Groq
# Load environment variables
load_dotenv()

# Configure Reddit client
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

# Configure Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_dynamic_subreddits(sector, min_subscribers=20000, limit=10):
    """Fetch popular subreddits related to a sector using Reddit API search."""
    try:
        results = reddit.subreddits.search(query=sector, limit=limit)
        subreddits = [
            sub.display_name
            for sub in results
            if getattr(sub, "subscribers", 0) >= min_subscribers
        ]
        return subreddits if subreddits else ['entrepreneur', 'smallbusiness', 'business']
    except Exception as e:
        print(f"Error fetching subreddits: {e}")
        return ['entrepreneur', 'smallbusiness', 'business']

def scrape_reddit_by_sector(sector, posts_per_subreddit=40):
    """Scrape Reddit posts from dynamically found subreddits for a sector."""
    subreddits = get_dynamic_subreddits(sector)
    all_posts_data = []

    print(f"Found subreddits for '{sector}': {subreddits}")

    for subreddit_name in subreddits:
        try:
            print(f"Scraping r/{subreddit_name}...")
            subreddit = reddit.subreddit(subreddit_name)

            posts_data = []
            for post in subreddit.top(time_filter="all", limit=posts_per_subreddit):
                posts_data.append({
                    "title": post.title,
                    "selftext": post.selftext,
                    "score": post.score,
                    "num_comments": post.num_comments,
                    "url": post.url,
                    "subreddit": subreddit_name
                })

            all_posts_data.extend(posts_data)
            print(f"  → Scraped {len(posts_data)} posts from r/{subreddit_name}")

        except Exception as e:
            print(f"  → Error scraping r/{subreddit_name}: {e}")
            continue

    df = pd.DataFrame(all_posts_data)
    print(f"Total posts scraped: {len(df)}")
    return df

def filter_pain_point_posts(posts_df, similarity_threshold=0.10):
    """Filter posts that are likely to contain pain points using embedding similarity."""
    model = SentenceTransformer('all-MiniLM-L6-v2')

    pain_point_references = [
        "I'm struggling with finding customers for my business",
        "I can't figure out how to market my product effectively",
        "I'm having trouble managing my time and productivity",
        "I'm frustrated with expensive software that doesn't work well",
        "I need help with bookkeeping and financial tracking",
        "I'm overwhelmed with administrative tasks and paperwork",
        "I can't find reliable suppliers or vendors",
        "I'm having difficulty scaling my business operations",
        "I need better tools for project management and collaboration",
        "I'm struggling to understand my customers' needs and feedback",
        "I have problems with inventory management and tracking",
        "I need help with hiring and managing employees",
        "I'm frustrated with slow or unreliable technology solutions"
    ]

    reference_embeddings = model.encode(pain_point_references)

    posts_df['combined_text'] = posts_df['title'].fillna('') + ' ' + posts_df['selftext'].fillna('')
    posts_df = posts_df[posts_df['combined_text'].str.len() > 50].copy()

    print("Creating embeddings for posts...")
    post_embeddings = model.encode(posts_df['combined_text'].tolist(), show_progress_bar=True)

    print("Calculating similarity scores...")
    similarity_scores = []
    for post_embedding in post_embeddings:
        similarities = cosine_similarity([post_embedding], reference_embeddings)[0]
        max_similarity = np.max(similarities)
        similarity_scores.append(max_similarity)

    posts_df['pain_point_score'] = similarity_scores
    filtered_posts = posts_df[posts_df['pain_point_score'] >= similarity_threshold].copy()
    filtered_posts['engagement_score'] = filtered_posts['score'] + (filtered_posts['num_comments'] * 2)
    filtered_posts = filtered_posts.sort_values(['pain_point_score', 'engagement_score'], ascending=[False, False])

    print(f"Original posts: {len(posts_df)}")
    print(f"Filtered posts: {len(filtered_posts)}")
    print(f"Filter ratio: {len(filtered_posts)/len(posts_df)*100:.1f}%")
    print(f"Average pain point score of filtered posts: {filtered_posts['pain_point_score'].mean():.3f}")

    return filtered_posts

def identify_and_validate_problems(posts_df, max_posts=20, retries=3, delay=2):
    """Process filtered posts with Groq API - validate if they're real problems and extract solutions."""
    valid_problems = []
    top_posts = posts_df.head(max_posts)

    print(f"\nProcessing {len(top_posts)} filtered posts with Groq API...")

    for idx, row in top_posts.iterrows():
        text_content = f"Title: {row['title']}\nBody: {row['selftext']}"

        prompt = f"""
You are an expert problem validator and solution analyst.

STEP 1: Determine if this Reddit post describes a genuine business/entrepreneurial PROBLEM or pain point.
STEP 2: If it IS a problem, extract ONE core problem and provide ONE practical solution.

Requirements:
- Only respond if this post describes a real problem/frustration/pain point
- If it's just a success story, general discussion, or question without a problem, respond with "NOT_A_PROBLEM"
- Problem: 1-2 lines maximum, focus on the main pain point
- Solution: 1-2 lines maximum, suggest a specific product/service

Format your response EXACTLY like this:
IS_PROBLEM: YES/NO
PROBLEM: [problem statement if YES, otherwise leave blank]
SOLUTION: [solution statement if YES, otherwise leave blank]

{text_content}
"""

        for attempt in range(retries):
            try:
                chat_completion = groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature=0.3,
                    max_tokens=200,
                )

                response_text = chat_completion.choices[0].message.content.strip()

                if "IS_PROBLEM: YES" in response_text and "NOT_A_PROBLEM" not in response_text:
                    valid_problems.append({
                        'title': row['title'],
                        'score': row['score'],
                        'num_comments': row['num_comments'],
                        'pain_point_score': row['pain_point_score'],
                        'analysis': response_text
                    })
                    print(f"✓ Valid problem found ({len(valid_problems)} total)")
                else:
                    print(f"✗ Not a problem - filtered out")

                break

            except Exception as e:
                print(f"Error processing post {idx}: {e}")
                if attempt < retries - 1:
                    print(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    print(f"Failed to process post {idx} after {retries} attempts.")

        time.sleep(1)

    return pd.DataFrame(valid_problems)
