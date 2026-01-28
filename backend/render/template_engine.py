"""Template rendering engine for exam generation.

This module handles the rendering of exam data into HTML format using Jinja2.
"""

import json
import base64
import zlib
from pathlib import Path
from jinja2 import Environment, FileSystemLoader


def encode_mermaid_to_kroki_url(mermaid_code: str) -> str:
    """Encode Mermaid code to Kroki API URL format.

    Args:
        mermaid_code: Mermaid diagram code as string.

    Returns:
        str: Full Kroki API URL for the diagram image.

    Example:
        >>> code = "erDiagram\\n    CUSTOMER ||--o{ ORDER : places"
        >>> url = encode_mermaid_to_kroki_url(code)
        >>> # Returns: https://kroki.io/mermaid/png/eNqrVkr...
    """
    # Compress the mermaid code using zlib
    compressed = zlib.compress(mermaid_code.encode('utf-8'), level=9)

    # Encode to base64 and make URL-safe
    encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')

    # Return full Kroki API URL
    return f"https://kroki.io/mermaid/png/{encoded}"


def render_exam_html(exam_data: dict) -> str:
    """Render exam data to HTML using Jinja2 template.

    Args:
        exam_data: Dictionary containing exam structure with the following keys:
            - exam_title (str): Title of the exam
            - sql_part (dict): SQL section with 'mermaid_code' and 'questions'
            - testing_part (dict): Testing section with 'scenario', 'rules_table', and 'question'

    Returns:
        str: Rendered HTML content ready for PDF conversion or display.

    Raises:
        FileNotFoundError: If template file does not exist.
        KeyError: If required keys are missing from exam_data.

    Example:
        >>> exam_data = {
        ...     "exam_title": "Database & Testing Exam",
        ...     "sql_part": {
        ...         "mermaid_code": "erDiagram...",
        ...         "questions": ["SELECT * FROM users;"]
        ...     },
        ...     "testing_part": {
        ...         "scenario": "Test a login system",
        ...         "rules_table": [{"condition": "Valid user", "result": "Access granted"}],
        ...         "question": "Design test cases"
        ...     }
        ... }
        >>> html = render_exam_html(exam_data)
    """
    # Parse exam_data if it's a JSON string
    if isinstance(exam_data, str):
        exam_data = json.loads(exam_data)

    # Convert Mermaid code to Kroki URL if present
    if 'sql_part' in exam_data and 'mermaid_code' in exam_data['sql_part']:
        mermaid_code = exam_data['sql_part']['mermaid_code']
        exam_data['sql_part']['mermaid_image_url'] = encode_mermaid_to_kroki_url(mermaid_code)

    # Determine template directory (relative to this file)
    current_dir = Path(__file__).parent
    template_dir = current_dir.parent / "templates"

    # Setup Jinja2 environment with FileSystemLoader
    env = Environment(loader=FileSystemLoader(str(template_dir)))

    # Load the exam template
    template = env.get_template("exam.html")

    # Render template with exam data
    html_content = template.render(exam=exam_data)

    return html_content
