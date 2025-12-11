# Project Overview
MentorAce AI is a Flask-based web application that evaluates uploaded mentor videos, generates performance scores, compares mentors, and provides insights through dashboards.
The system includes authentication, mentor management, evaluation logic, and analytics.

The platform supports:

- User signup/login
- Video upload
- Automatic evaluation score generation
- Mentor score comparison
- Dashboard with average score, total mentors, graph insights
All backend logic is structured using Flask blueprints for clean modular development.

## Setup Instructions
- 1. Clone the project
```
git clone your-repo-link
cd your-project-folder
```
- 2. Create a virtual environment
```
python -m venv venv
```
- 3. Activate environment
-- Windows:
```
venv\Scripts\activate
```
-- Mac/Linux:
```
source venv/bin/activate
```
- 4. Install dependencies
```
pip install -r requirements.txt
```
- 5. Set Flask environment
```
set FLASK_APP=app.py
set FLASK_ENV=development
```
(Mac/Linux use export instead of set)
- 6. Run the app
```
python app.py
```
## Architecture Overview
### Main Modules
|Module	           |  Purpose                                 |
|------------------|------------------------------------------|
|auth	             | Handles signup, login, logout            | 
|mentor	           | Upload videos, evaluate mentor scores    | 
|institution	     | Analytics, institution info              | 
|core Flask app	   | Routes for pages + blueprint registration|

## How to Run Locally
- Install dependencies
- Run python app.py
- Open browser:
```
http://127.0.0.1:5000
```
