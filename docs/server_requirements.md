# Backend Installation Guide

This guide provides instructions for setting up and running the backend server for the inventory system.

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation Steps

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd inventory_system
    ```
    (Replace `<repository_url>` with the actual URL of your repository.)

2.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

3.  **Create a virtual environment (recommended):**

    Creating a virtual environment isolates the project's dependencies.

    ```bash
    python3 -m venv venv
    ```

4.  **Activate the virtual environment:**

    - On Windows:

      ```bash
      venv Scripts activate
      ```

    - On macOS and Linux:

      ```bash
      source venv/bin/activate
      ```

5.  **Install the dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

6. **Run the application**
    ```bash
    python code.py
    ```
    The application will be accessible at `http://0.0.0.0:5000`.