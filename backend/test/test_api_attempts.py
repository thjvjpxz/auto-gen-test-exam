import httpx
import json
import asyncio

BASE_URL = "http://localhost:8000"
AUTH_EMAIL = "123@123.com"
AUTH_PASSWORD = "123Cuong"
EXAM_ID = 1

async def test_exam_attempts_flow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Login
        print("\n--- 1. Logging in ---")
        login_data = {"email": AUTH_EMAIL, "password": AUTH_PASSWORD}
        response = await client.post("/api/auth/login", json=login_data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")

        # 2. Start Exam
        print(f"\n--- 2. Starting Exam (ID: {EXAM_ID}) ---")
        response = await client.post(f"/api/v1/exams/{EXAM_ID}/start", headers=headers)
        if response.status_code not in [200, 201]:
            print(f"Start exam failed: {response.text}")
            return
        
        attempt_data = response.json()
        attempt_id = attempt_data["attempt_id"]
        print(f"Exam started. Attempt ID: {attempt_id}")

        # 3. Auto-save Answers
        print(f"\n--- 3. Auto-saving answers ---")
        save_data = {
            "answers": {
                "sql_part": {
                    "question_1_answer": "SELECT * FROM patients WHERE age > 60;",
                },
                "testing_part": {
                    "technique": "BVA",
                    "explanation": "Testing boundary values for age fields."
                }
            }
        }
        response = await client.patch(f"/api/v1/attempts/{attempt_id}/save", headers=headers, json=save_data)
        if response.status_code != 200:
            print(f"Save failed: {response.text}")
        else:
            print("Answers saved successfully.")

        # 4. Log Violation
        print(f"\n--- 4. Logging violation (tab_switch) ---")
        violation_data = {
            "violation_type": "tab_switch",
            "timestamp": "2025-01-30T10:30:00Z",
            "details": "User switched tab to browse documentation"
        }
        response = await client.post(f"/api/v1/attempts/{attempt_id}/violations", headers=headers, json=violation_data)
        if response.status_code != 200:
            print(f"Violation log failed: {response.text}")
        else:
            print(f"Violation logged. Trust score: {response.json().get('trust_score')}")

        # 5. Submit Exam
        print(f"\n--- 5. Submitting Exam ---")
        submit_data = {
            "answers": {
                "sql_part": {
                    "question_1_answer": "SELECT * FROM patients WHERE age > 60;",
                    "question_2_answer": "SELECT name FROM doctors WHERE specialty = 'Cardiology';"
                },
                "testing_part": {
                    "technique": "EP",
                    "explanation": "Partitioning patient ages into valid/invalid ranges.",
                    "test_cases": [
                        {"input": "age = 25", "expected_output": "Accepted"},
                        {"input": "age = -1", "expected_output": "Rejected"}
                    ]
                }
            }
        }
        response = await client.post(f"/api/v1/attempts/{attempt_id}/submit", headers=headers, json=submit_data)
        if response.status_code != 200:
            print(f"Submit failed: {response.text}")
        else:
            result = response.json()
            print(f"Exam submitted. Score: {result.get('score')}/{result.get('max_score')}")
            print(f"AI Overall Feedback: {result.get('grading', {}).get('overall_feedback')}")

        # 6. Get Result
        print(f"\n--- 6. Getting Result ---")
        response = await client.get(f"/api/v1/attempts/{attempt_id}/result", headers=headers)
        if response.status_code != 200:
            print(f"Get result failed: {response.text}")
        else:
            print("Result retrieved successfully.")

if __name__ == "__main__":
    asyncio.run(test_exam_attempts_flow())
