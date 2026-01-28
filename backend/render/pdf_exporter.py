"""PDF exporter module using WeasyPrint for HTML to PDF conversion.

This module provides functionality to render HTML content to PDF documents
using WeasyPrint, a pure Python PDF renderer.
"""

from io import BytesIO
from weasyprint import HTML, CSS


async def render_to_pdf(html_content: str) -> bytes:
    """Render HTML content to PDF using WeasyPrint.

    This function uses WeasyPrint to convert HTML to PDF, providing a
    high-quality document suitable for printing. WeasyPrint is a pure Python
    library that doesn't require external dependencies like wkhtmltopdf.

    Args:
        html_content: HTML string to be rendered. Should be a complete HTML document
                      with proper structure (<!DOCTYPE html>, <html>, <head>, <body>).

    Returns:
        bytes: PDF data as bytes, ready to be written to file or sent over network.

    Raises:
        IOError: If WeasyPrint fails to render the HTML to PDF.

    Example:
        >>> html = "<html><body><h1>Test Exam</h1></body></html>"
        >>> pdf_bytes = await render_to_pdf(html)
        >>> with open("exam.pdf", "wb") as f:
        ...     f.write(pdf_bytes)

    Note:
        - No external dependencies required (pure Python implementation)
        - More memory-efficient than wkhtmltopdf-based solutions
    """
    # CSS for page size and margins (A4 with 0.75in margins)
    page_css = CSS(string='''
        @page {
            size: A4;
            margin: 0.75in;
        }
    ''')

    try:
        # Convert HTML to PDF and write to BytesIO buffer
        pdf_buffer = BytesIO()
        HTML(string=html_content).write_pdf(pdf_buffer, stylesheets=[page_css])
        pdf_bytes = pdf_buffer.getvalue()
        return pdf_bytes
    except Exception as e:
        raise IOError(f"Failed to render HTML to PDF: {str(e)}")
