from flask import Flask, request, jsonify
from flask_cors import CORS
from reddit import scrape_reddit_by_sector, filter_pain_point_posts, identify_and_validate_problems
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

app = Flask(__name__)
CORS(app)  # allow frontend to talk to backend

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        sector = data.get("sector", None)

        if not sector:
            return jsonify({"error": "Sector name is required"}), 400

        # Step 1: Scrape
        df_posts = scrape_reddit_by_sector(sector, posts_per_subreddit=30)

        # Step 2: Filter pain points
        filtered_df = filter_pain_point_posts(df_posts, similarity_threshold=0.35)

        # Step 3: Validate problems
        results_df = identify_and_validate_problems(filtered_df, max_posts=20)

        if results_df.empty:
            return jsonify({"message": "No valid problems found"}), 200

        # Parse problem & solution fields
        final_data = []
        for _, row in results_df.iterrows():
            final_data.append({
                "title": row["title"],
                "score": row["score"],
                "num_comments": row["num_comments"],
                "pain_point_score": row["pain_point_score"],
                "analysis": row["analysis"]
            })

        return jsonify({"results": final_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
 