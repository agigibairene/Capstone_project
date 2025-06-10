# Capstone_project

## Prerequisites
1. [Docker](https://www.docker.com/get-started/)
2. [Python]()

## Visit Frontend here  
👉 [Visit UI](https://capstone-frontend-opal.vercel.app/)

## Technologies and Packages used
```
    1. Frontend: 
       - React TypeScript + vite
       - Tailwind CSS (A CSS framework for styling) & vanilla CSS
       - Framer motion for animation
       - React icons
       - Redux and Redux toolkit for state management
       - React Router DOM for routing
       - Animated images from lottie files

    2. Backend: 
       -  Django
       -  Postgresql for the Database
```

## Set up project
```
    unzip Capstone_project.zip
    cd Capstone_project
```

## Setting up Frontend:
```
    cd crowdfunding_frontend
    docker build -t crowdfunding_frontend .
    docker run -d -p 5173:5173 crowdfunding_frontend
```

## Setting up Backend:
```
    cd backend
    python -m venv venv
    venv\Scripts\activate.bat (for windows)
    pip install -r requirements.txt
```