def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list:
    """
    chunk_size: how many words per chunk (400 is a good default)
    overlap: how many words to repeat from the previous chunk
    """
    words = text.split()  # split text into individual words
    chunks = []
    i = 0
    while i < len(words):
        chunk = ' '.join(words[i : i + chunk_size])  # take next 400 words
        if chunk.strip():  # skip empty chunks
            chunks.append(chunk)
        i += (chunk_size - overlap)  # move forward but keep 50 words overlap
    return chunks
