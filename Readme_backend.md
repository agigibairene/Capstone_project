# Capstone_project

## Prerequisites
1. [Python](https://www.python.org/downloads/)

## Visit Frontend here  
👉 [Visit UI](https://agriconnect-p2ssy.ondigitalocean.app/)

## GitHuB Repository URL
[GITHUB LINK](https://github.com/agigibairene/Capstone_project)

## Features
- Farmer and Investor Registration with Role-Based Access
- JWT Authentication (via djangorestframework-simplejwt)
- Secure Email Login with Custom Backend
- NDA Enforcement with E-Signature Tracking
- Watermarked PDF Uploads for Idea Protection (PyPDF2)
- Admin Dashboard for Approvals and Monitoring
- GPT-Powered Chatbot (via API integration)
- Project Listings with Detailed Proposals
- CORS Support for Cross-Origin API Access
- Environment-based Configuration (python-dotenv)
- Secure File Uploads (DigitalOcean Spaces)
- Unit and Integration Tests
- Admin UI Theming with Jazzmin
- API Integration for React Frontend
- Grants and Opportunities
- Database Migrations
- Whitenoise for Static File Serving
- Comprehensive Error Handling
- User Authentication and Authorization


## Tech Stack


| Component         | Technology                          |
|------------------|-------------------------------------|
| Backend           | Django 5.2                          |
| Database          | PostgreSQL                          |
| Authentication    | Django REST Framework + SimpleJWT  |
| Admin Interface   | Jazzmin (enhanced Django admin)     |
| File Storage      | DigitalOcean Spaces                 |
| Task Queue        | Celery with Beat Scheduler          |
| Email             | SMTP (Gmail)                        |
| Static Files      | WhiteNoise                          |
| CORS              | django-cors-headers                 |

## Project Structure

A robust Django REST API backend built with Django and Django REST Framework.

```
backend/
├── apis/                                        
│   ├──fonts/                    
│   ├──migrations/              
│   ├──templates/               
│   ├──views/                    
│   ├──__init__.py              
│   ├── admin.py                
│   ├──apps.py                  
│   ├──backends.py              
│   ├── models.py               
│   ├──opportunities.py        
│   ├──permissions.py           
│   ├──serializers.py          
│   ├──signals.py               
│   ├──tests.py                 
│   └──urls.py                 
├──  backend/                       
│   ├──__init__.py               
│   ├──asgi.py                 
│   ├── settings.py            
│   ├──storage_backends.py      
│   └──urls.py                                 
├── static/                  
├── venv/                    
├──.env                    
├──.gitignore               
├── manage.py               
└──requirements.txt         
```

### Key Directories & Files

#### APIs App (`apis/`)
- **`models.py`** - Database models for core functionality
- **`serializers.py`** - DRF serializers for API request/response handling
- **`views/`** - Organized API view classes and functions
- **`permissions.py`** - Custom permission classes for authorization
- **`opportunities.py`** - Cleaning up expired opportunities 
- **`backends.py`** - Custom authentication backend implementations
- **`signals.py`** - Automated tasks triggered by model events
- **`migrations/`** - Database schema migration files
- **`templates/`** - HTML templates for admin dashboard
- **`urls.py`** - URL routing to different views

#### Project Configuration (`backend/`)
- **`settings.py`** - Django configuration, database, middleware settings
- **`urls.py`** - Main URL routing to different apps
- **`storage_backends.py`** - Custom storage configurations (AWS S3, etc.)
- **`asgi.py`** - ASGI server configuration for async operations



## Installation

### 0. For zipped folder
```
    unzip Capstone_project.zip
    cd Capstone_project
```

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/your-django-backend.git
cd your-django-backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate  
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment setup

Create a `.env` file in the project root:

#### Environment Configuration:
Create a `.env` file in the project root with the required variables:

```
SECRET_KEY=your-django-secret
DEBUG=True
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
SPACES_KEY=your-digitalocean-access-key
SPACES_SECRET=your-digitalocean-secret
```

### 5. Database setup

### Production Settings

0. Use digital ocean
1. Set `DEBUG=False` in production
2. Configure a production database (PostgreSQL recommended on digital ocean)
3. Set proper `ALLOWED_HOSTS`
4. Configure static files serving (add app component on )
5. Upload .env



```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

```bash
python manage.py collectstatic
```

### 6. Run the development server

```bash
python manage.py runserver
```

**Static files not loading:**
Run `python manage.py collectstatic` and check `STATIC_URL` settings.


The API path `http://localhost:8000/`



#### Feature Apps
- **`profiles/`** - User profile models, views, and profile management when in dev mode
- **`proposals/`** - Proposal creation, management, and workflow  when in dev mode
- **`documents/`** - File upload, storage, and document processing  when in dev mode

## API Endpoints


###  Authentication
- `POST /auth/signup/` – User registration  
- `POST /auth/login/` – User login  
- `POST /auth/logout/` – User logout  
- `POST /auth/forgot-password/` – Password reset request  
- `POST /auth/reset-password/<reset_id>/` – Password reset confirmation  
- `POST /auth/token/refresh/` – JWT token refresh  
- `GET /auth/profile/` – Get user profile  
- `PUT /auth/profile-update/` – Update user profile  

### OTP Management
- `POST /auth/verify-otp/` – Verify login OTP  
- `POST /auth/resend-otp/` – Resend login OTP  

### KYC Management
- `POST /kyc/investor/submit/` – Submit investor KYC  
- `POST /kyc/farmer/submit/` – Submit farmer KYC  
- `GET /admin/kyc/pending/` – List pending KYC submissions (admin)  
- `POST /admin/kyc/verify/<user_id>/` – Verify KYC (admin)  
- `POST /kyc/request-change/` – Request KYC changes  
- `GET /kyc/user/` – Get user KYC information  
- `GET /kyc/status/` – Get KYC verification status  
- `GET /kyc/autofill/` – Get autofill data for KYC  

### Opportunities
- `GET /opportunities/` – List all opportunities  
- `GET /opportunities/<id>/` – Get opportunity details  
- `POST /opportunities/create/` – Create new opportunity  
- `PUT /opportunities/<id>/update/` – Update opportunity  
- `DELETE /opportunities/<id>/delete/` – Delete opportunity  
- `GET /opportunities/stats/` – Get opportunity statistics  

### Projects
- `POST /projects/create/` – Create new project  
- `GET /projects/` – List all projects  
- `GET /projects/<uuid>/` – Get project details  
- `GET /farmer/projects/` – List farmer's projects  
- `GET /projects/search/` – Search projects  
- `GET /projects/sum/` – Get farmer project summaries  
- `GET /projects/recommended/` – Get recommended projects  
- `POST /submit-nda/` – Submit NDA agreement  
- `GET /check-nda-status/` – Check NDA status  
- `GET /download-nda/` – Download NDA PDF  


## Development

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.users

```

## Contributor
[Irene Akawin Agigiba](https://portfolio-hdhr.vercel.app/)  - Full Stack developer
