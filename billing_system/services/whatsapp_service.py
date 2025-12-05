def send_whatsapp_message(phone_number: str, message: str, attachment_path: str = None):
    """
    Mock function to simulate sending a WhatsApp message.
    In a real implementation, this would use WhatsApp Business API.
    """
    print(f"--- Sending WhatsApp Message ---")
    print(f"To: {phone_number}")
    print(f"Message: {message}")
    if attachment_path:
        print(f"Attachment: {attachment_path}")
    print(f"--- Message Sent (Mock) ---")
    return True
