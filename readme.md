# LM Spell Web App

This repository contains the web app for the LM Spell Library. The project consists of two main parts:
    - **Frontend:** Native PHP
    - **Backend:** Flask

## Getting Started

### Prerequisites

- Python 3.x installed

### Installation

- Clone the repository:
    ```bash
    git clone <repository-url>
    cd lm-spell-web-app
    ```

## Backend

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2. Start the backend server:

    ```bash
    cd backend
    python3 app.py
    ```

### Running in Test Mode

In test mode, the backend will mock the `LmSpell` class and simply return the input sentence without loading actual classes and models.

    ```bash
    cd backend
    python3 app.py --test
    ```


## Frontend

1. Start the frontend server:

    ```bash
    php -S localhost:8080
    ```

---

For more details, refer to the project documentation or contact the maintainers.