class GreetingProvider:
    def render(self, name):
        return "Hello, " + str(name)

class GreetingFacade:
    def __init__(self):
        self.provider = GreetingProvider()

    def render(self, name):
        return self.provider.render(name)

def render(name):
    return GreetingFacade().render(name)
