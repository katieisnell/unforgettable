import os

import cherrypy 
from jinja2 import Environment, FileSystemLoader

APP_ID = '374405813315469'
REDIRECT_URI = 'https%3A%2F%2Fkatieisnell.github.io%2F'
INSTA_AUTHORISE_URI = 'https://api.instagram.com/oauth/authorize/'

INSTA_AUTHORISE_URI += '?app_id={app_id}'.format(
    app_id=APP_ID
)
INSTA_AUTHORISE_URI += '&redirect_uri={redirect_uri}'.format(
    redirect_uri=REDIRECT_URI
)
INSTA_AUTHORISE_URI += '&scope=user_profile,user_media&response_type=code'

template_environment = Environment(loader=FileSystemLoader('thtml'))


class InstaConsent(object):
    @cherrypy.expose
    def index(self):
        template = template_environment.get_template('consent.thtml')
        context = dict()
        return template.render(context)

    @cherrypy.expose
    def thanks(self, code):
        template = template_environment.get_template('thanks.thtml')
        context = dict()
        return template.render(context)

    @cherrypy.expose
    def authorise(self):
        print(cherrypy.url)
        raise cherrypy.HTTPRedirect(INSTA_AUTHORISE_URI.format(redirect_uri=''))


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './static'
        }
    }
    cherrypy.quickstart(InstaConsent(), '/', conf)
