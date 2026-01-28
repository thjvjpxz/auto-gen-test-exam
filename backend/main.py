"""Telegram Bot for AI-powered exam generation.

This module implements a Telegram bot that generates Vietnamese IT exams using
Google Gemini AI and delivers them as PDF documents directly to users.

The bot provides commands:
    /gen - Generate a new exam and send it as PDF
    /help - Display usage instructions

Architecture:
    User -> Telegram Bot -> AI Generator -> Render HTML -> Export PDF -> Send to User
"""

import logging
from io import BytesIO

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from core.ai_generator import ExamGenerator
from core.config import TELEGRAM_BOT_TOKEN
from render.template_engine import render_exam_html
from render.pdf_exporter import render_to_pdf


# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /start command.

    Sends a welcome message to new users explaining the bot's purpose and available commands.

    Args:
        update: Telegram update object containing message data.
        context: Telegram context for this handler.
    """
    welcome_message = (
        "👋 Chào mừng bạn đến với Bot Tạo Đề Thi Tự Động!\n\n"
        "🤖 Bot này sử dụng AI để tạo đề thi CNTT ngẫu nhiên với:\n"
        "   • Phần SQL (Database với Mermaid ERD)\n"
        "   • Phần Testing (Kỹ thuật kiểm thử hộp đen)\n\n"
        "📝 Sử dụng /gen để tạo đề thi mới dạng PDF\n"
        "ℹ️ Sử dụng /help để xem hướng dẫn chi tiết"
    )
    await update.message.reply_text(welcome_message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /help command.

    Displays detailed usage instructions and available commands to the user.

    Args:
        update: Telegram update object containing message data.
        context: Telegram context for this handler.
    """
    help_text = (
        "📚 *Hướng dẫn sử dụng Bot Tạo Đề Thi*\n\n"
        "*Commands:*\n"
        "/start - Khởi động bot và xem giới thiệu\n"
        "/gen - Sinh đề thi mới và nhận file PDF\n"
        "/help - Hiển thị hướng dẫn này\n\n"
        "*Quy trình:*\n"
        "1️⃣ Gửi lệnh /gen\n"
        "2️⃣ Chờ AI sinh nội dung (10-20 giây)\n"
        "3️⃣ Nhận đề thi dưới dạng file PDF\n\n"
        "*Nội dung đề thi:*\n"
        "• Phần 1: SQL với ERD diagram và câu hỏi truy vấn\n"
        "• Phần 2: Testing với tình huống và bảng quy tắc\n\n"
        "⚡ Mỗi lần sinh đề đều hoàn toàn mới và ngẫu nhiên!\n\n"
        "💡 Tip: Bạn có thể in file PDF này để làm bài tập."
    )
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def gen_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /gen command to generate and send exam as PDF.

    This is the main handler that orchestrates the complete exam generation workflow:
    1. Notify user that generation has started
    2. Call AI to generate exam content as JSON
    3. Render JSON to HTML using Jinja2 template
    4. Convert HTML to PDF document using pdfkit
    5. Send PDF file back to user

    Args:
        update: Telegram update object containing message data.
        context: Telegram context for this handler.

    Error Handling:
        All exceptions are caught and user-friendly error messages are sent.
        Detailed errors are logged for debugging purposes.
    """
    # Notify user that generation has started
    await update.message.reply_text(
        "⏳ Đang sinh đề thi PDF...\n"
        "Vui lòng chờ khoảng 10-20 giây trong khi AI tạo nội dung."
    )

    try:
        # Step 1: Generate exam content using AI
        logger.info(f"User {update.effective_user.id} requested exam generation")
        generator = ExamGenerator()
        exam_data = generator.generate_exam()
        logger.info("Exam content generated successfully")

        # Step 2: Render exam data to HTML
        html_content = render_exam_html(exam_data)
        logger.info("HTML template rendered successfully")

        # Step 3: Convert HTML to PDF
        await update.message.reply_text("📄 Đang chuyển đổi sang định dạng PDF...")
        pdf_bytes = await render_to_pdf(html_content)
        logger.info("PDF created successfully")

        # Step 4: Send PDF to user
        await update.message.reply_document(
            document=BytesIO(pdf_bytes),
            filename=f"{exam_data['exam_title'].replace(' ', '_')}.pdf",
            caption=(
                f"📝 *{exam_data['exam_title']}*\n\n"
                "✅ Đề thi PDF đã được tạo thành công!\n"
                "🔄 Gửi /gen để tạo đề thi mới."
            ),
            parse_mode='Markdown'
        )

        logger.info(f"Exam PDF sent successfully to user {update.effective_user.id}")

    except ValueError as e:
        # Handle validation errors (missing config, invalid structure)
        error_msg = (
            "❌ Lỗi cấu hình hệ thống.\n"
            "Vui lòng liên hệ quản trị viên để kiểm tra API keys và cấu hình."
        )
        await update.message.reply_text(error_msg)
        logger.error(f"Configuration error: {str(e)}")

    except Exception as e:
        # Handle all other errors with user-friendly message
        error_msg = (
            "❌ Có lỗi xảy ra trong quá trình tạo đề thi.\n"
            "Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu lỗi tiếp diễn.\n\n"
            f"Chi tiết: {type(e).__name__}"
        )
        await update.message.reply_text(error_msg)
        logger.error(f"Error generating exam: {str(e)}", exc_info=True)


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Global error handler for uncaught exceptions.

    This handler catches any errors that weren't handled by individual command handlers
    and logs them while notifying the user.

    Args:
        update: Telegram update object that caused the error.
        context: Telegram context containing error information.
    """
    logger.error(f"Update {update} caused error: {context.error}", exc_info=context.error)

    # Try to notify user if possible
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "⚠️ Đã xảy ra lỗi không mong muốn.\n"
            "Vui lòng thử lại hoặc liên hệ quản trị viên."
        )


def main() -> None:
    """Initialize and run the Telegram bot.

    This function sets up the bot application with all command handlers and starts
    polling for updates. It validates the bot token before starting.

    Raises:
        ValueError: If TELEGRAM_BOT_TOKEN is not configured in environment.

    The bot will run indefinitely until interrupted (Ctrl+C) or an error occurs.
    """
    # Validate bot token
    if not TELEGRAM_BOT_TOKEN:
        raise ValueError(
            "TELEGRAM_BOT_TOKEN is not set. "
            "Please configure it in your .env file."
        )

    # Create application instance
    logger.info("Initializing Telegram bot application...")
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register command handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("gen", gen_command))

    # Register global error handler
    application.add_error_handler(error_handler)

    # Start the bot
    logger.info("Starting bot polling...")
    logger.info("Bot is ready! Press Ctrl+C to stop.")

    try:
        application.run_polling(allowed_updates=Update.ALL_TYPES)
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        raise


if __name__ == '__main__':
    main()
