# Reddit Opportunity Finder (Community Insights Engine)

This project is a full-stack application designed to help users discover new business opportunities by analyzing "pain points" and frustrations shared on Reddit. It features a Python backend that scrapes relevant subreddits and a Next.js frontend that provides a clean user interface. The core functionality uses AI to filter posts for genuine problems and propose potential solutions.

---

### Features

* **Smart Search:** Users can input a specific sector (e.g., healthcare, finance) to find related business problems.
* **Dynamic Scraping:** The backend dynamically identifies and scrapes relevant subreddits using the Reddit API to gather real-time data.
* **AI-Powered Analysis:** A pre-trained embedding model filters for posts that are likely to contain pain points.
* **Problem Validation:** The Groq API is used to validate if a post describes a real problem and then generates a concise solution.
* **Responsive UI:** A modern, mobile-friendly interface built with Next.js and Tailwind CSS allows users to search and view results easily.

---

### Technologies Used

#### Backend
* **Python:** The core language for the backend API.
* **Flask:** A lightweight web framework for building the API.
* **PRAW (Python Reddit API Wrapper):** Used for scraping posts from Reddit.
* **Groq:** An AI API used for analyzing posts and generating solutions.
* **Pandas & NumPy:** Libraries for data manipulation and analysis.
* **Sentence-Transformers & scikit-learn:** Used for creating embeddings and calculating post similarity scores.
* **dotenv:** For managing API keys and environment variables securely.

#### Frontend
* **Next.js:** A React framework for building the web application.
* **React:** The core JavaScript library for the user interface.
* **TypeScript:** Used for type safety throughout the frontend code.
* **Tailwind CSS:** A utility-first CSS framework for styling components.
* **Shadcn UI:** A collection of pre-built UI components used for the design system.

---

### Setup Instructions

#### Prerequisites
* Python (3.7+)
* Node.js (18+)
* pnpm (or npm/yarn)

#### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

4.  Create a `.env` file in the `backend` directory and add your API keys:
    ```
    REDDIT_CLIENT_ID="your_reddit_client_id"
    REDDIT_CLIENT_SECRET="your_reddit_client_secret"
    REDDIT_USER_AGENT="your_reddit_user_agent"
    GROQ_API_KEY="your_groq_api_key"
    ```

5.  Run the Flask application:
    ```bash
    python app.py
    ```

#### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the dependencies using pnpm:
    ```bash
    pnpm install
    ```

3.  Run the Next.js development server:
    ```bash
    pnpm run dev
    ```

The application should now be accessible at `http://localhost:3000`.

---

### Usage

1.  On the main page, you will see a search bar and a list of popular sectors.
2.  Enter a sector (e.g., `healthcare`) and click **"Find Opportunities"**.
3.  The application will display a loading screen while the backend scrapes and analyzes Reddit posts.
4.  Once complete, a list of "opportunities" will appear, each detailing a problem, an AI-generated solution, and relevant metrics. You can copy the problem and solution to your clipboard.
5.  You can also perform a new search from the results page.
