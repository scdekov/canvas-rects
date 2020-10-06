# Test task skeleton

This contains the skeleton for the test task.
We assume that you have a terminal available that supports bash like commands.

## Running the API

The API should be implemented with FastAPI in Python.
This requires at least Python 3.6.

Setup:
```bash
cd api
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

To run, you always need to have the virtual environment activated.
This is usually indicated by a `(env)` prefix to your shell prompt.
If you don't have it activated yet, run `source env/bin/activate` again.
Then, to run the API:
```
python -m uvicorn main:app --reload
```

The API will now be available at `http://localhost:8000/`.
You do not need to manually restart the server if you make changes to the code, 
as the changes will be loaded automatically when you save a file.

## Running the UI

Setup:
```bash
cd ui
npm install
```

To run:
```bash
npm start
```

The UI will now be served at `http://localhost:3000/`.
The page should automatically reload when you save changes to a file.