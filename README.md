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
## API / Endpoints
### Authentication

|Endpoint	|Method	|Description    |
|---------|-------|---------------|
|/signup	|GET	  |Signup page    |
|/signup	|POST	  |Create account |
|/login	  |GET	  |Login page       |
|/login	  |POST	  |Authenticate user|
|/logout	|GET	  |Logout        |

### Mentor Evaluation
|Endpoint	                |Method	     |Description|
|-------------------------|------------|--------------|
|/upload_video	          |GET	       |Upload form|
|/upload_video	          |POST	       |Save video, generate score|
|/evaluation/<mentor_id>	|GET	       |Show score|
|/compare	                |GET/POST	   | Compare two mentor scores|

### Dashboard
|Endpoint	|Method	|Description|
|---------|-------|-----------|
|/	|GET	|Dashboard with graphs, avg score, top mentors|

## Example Inputs/Outputs
### Input Example (Upload Video POST)
```
mentor_name = "Rahul"
video_file = lecture.mp4
```
### Output Example
```
{
  "mentor": "Rahul",
  "score": 82,
  "status": "Evaluation Successful"
}
```
### Compare Output
```
{
  "mentor_1": { "name": "Rahul", "score": 82 },
  "mentor_2": { "name": "Priya", "score": 76 },
  "better_performer": "Rahul"
}
```
## List of Dependencies
```
Flask
Werkzeug
Gunicorn (if hosting)
python-dotenv
opencv-python (optional if used)
numpy
matplotlib
```
Add more based on your project.
## Contributors
- Tanvi Gupta — AI/ML Lead
        -- Model building, scoring engine, bias mitigation
- Taniya — Backend/API Developer
        -- FastAPI services, authentication, integrations
- Khushi Gupta — Frontend/UI Designer
        -- React interface, dashboards, user experience
- Mahika Shukla — Product & Research Lead
       -- Explainability, metric design, documentation, final pitch
