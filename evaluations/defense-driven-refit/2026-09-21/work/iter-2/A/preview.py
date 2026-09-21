def render(name):
    if not isinstance(name, str):
        raise TypeError("name must be a string")
    return "Hello, " + name
