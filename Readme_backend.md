# Capstone_project

## Prerequisites
1. [Python](https://www.python.org/downloads/)

## Visit Frontend here  
👉 [Visit UI](https://agriconnect-p2ssy.ondigitalocean.app/)

## GitHuB Repository URL
[GITHUB LINK](https://github.com/agigibairene/Capstone_project)

## Features

### Django:
- **User Authentication** (Sign up & Login) 
    - A Know-Your-Customer (KYC) follows whenever signup is successful (This is to help Agriconnect know users better)
    - Also submitted KYC data mus be verified by admin before users can access certain features on the platform
    - Multi-factor login is required, user recieves an OTP after submitting Email & password anytime they want to login
- **Database** using **PostgreSQL**
- **A**
- **Email Notifications** for OTP, sign ups, creating of projects using **Used SMTP**

## Set up project
```
    unzip Capstone_project.zip
    cd Capstone_project
```

## Setting up Backend:
```
    cd backend
    python -m venv venv
    venv\Scripts\activate (for windows)
    pip install -r requirements.txt
```



#### Environment Configuration:
Create a `.env` file in the project root with the required variables:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/Fitness_booking
DJANGO_SECRET_KEY=your_django_secret_key
POSTGRES_DB=Fitness_booking
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password


EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER=your_email_host_user
EMAIL_HOST_PASSWORD=your_email_password
DEBUG=True
```