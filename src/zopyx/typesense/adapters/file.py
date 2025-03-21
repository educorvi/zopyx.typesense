"""
Indexing adapter via Apache Tika for File content
"""


from plone import api
from zopyx.typesense.interfaces import ITypesenseSettings

import os
import tempfile
import tika
import tika.parser

from .. import LOG

import base64
from urllib.parse import urlparse

tika.initVM()

def check_basic_auth(url):
    parsed_url = urlparse(url)
    username = parsed_url.username
    password = parsed_url.password
    if username and password:
        credentials = f"{username}:{password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded_credentials}"}
    return

class FileIndexer:
    """Typesense indexer for IDocument"""

    def __init__(self, context):
        self.context = context

    def get_indexable_content(self, indexable_content):
        """Return indexable content for IFile"""

        # index content with Tika, if available
        tika_timeout = api.portal.get_registry_record("tika_timeout", ITypesenseSettings)
        tika_url = api.portal.get_registry_record("tika_url", ITypesenseSettings)
        if not tika_url:
            return indexable_content

        # save indexable content to temporary file
        tmp_fn = tempfile.mktemp()
        with open(tmp_fn, "wb") as fp:
            fp.write(self.context.file.data)

        # send temporary file to Apache Tika
        # check if url has BasicAuth-Header
        header = check_basic_auth(tika_url)
        try:
            if header:
                parsed = tika.parser.from_file(tmp_fn, serverEndpoint=tika_url, headers=header, requestOptions={'timeout':tika_timeout})
            else:
                parsed = tika.parser.from_file(tmp_fn, serverEndpoint=tika_url, requestOptions={'timeout':tika_timeout})
        except Exception as e:
            LOG.exception("Unable to interact with Tika", exc_info=True)
            #raise
            pass # Indexing should be continued even the interaction has some errors
        finally:
            os.unlink(tmp_fn)

        indexable_content["text"] += parsed["content"]
        return indexable_content
