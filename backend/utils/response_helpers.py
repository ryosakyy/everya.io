"""
Response helper functions for standardized API responses.
"""
from flask import jsonify


def success_response(data=None, message: str = "Operación exitosa", **kwargs):
    """
    Create a successful JSON response.
    
    Args:
        data: Optional data to include
        message: Success message
        **kwargs: Additional fields to include
    
    Returns:
        Flask JSON response with 200 status
    """
    response = {"success": True, "mensaje": message}
    if data is not None:
        response["data"] = data
    response.update(kwargs)
    return jsonify(response)


def error_response(message: str = "Error interno", status_code: int = 500, **kwargs):
    """
    Create an error JSON response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        **kwargs: Additional fields to include
    
    Returns:
        Flask JSON response with error status
    """
    response = {"success": False, "mensaje": message}
    response.update(kwargs)
    return jsonify(response), status_code
