from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.utils.logger import logger


class AppException(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


class TicketNotFoundException(AppException):
    def __init__(self, ticket_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"Ticket with ID '{ticket_id}' was not found in the database."
        )


class DatabaseException(AppException):
    def __init__(self, original_error: Exception):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An unexpected database error occurred. Please try again later."
        )
        self.original_error = original_error


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers custom exception handlers globally on the FastAPI application.
    Automatically logs errors using our custom logging utility and returns normalized JSON responses.
    """
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.error(f"AppException occurred: {exc.message} (Status Code: {exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "type": exc.__class__.__name__,
                    "message": exc.message
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.critical(f"Unhandled Exception occurred: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "type": "UnhandledServerError",
                    "message": "An unexpected server error occurred."
                }
            }
        )
