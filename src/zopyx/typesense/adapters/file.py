"""
Indexing adapter via Apache Tika for File content
"""


from plone import api
from zopyx.typesense.interfaces import ITypesenseSettings

import time
import os
import tempfile
import tika
import tika.parser

from .. import LOG

import logging
logger = logging.getLogger("zopyx.typesense")

tika.initVM()

class FileIndexer:
    """Typesense indexer for IDocument"""

    def __init__(self, context):
        self.context = context

    def get_indexable_content(self, indexable_content):
        """Return indexable content for IFile"""

        max_retries = 3
        retry_delay = 2  # Initial retry delay in seconds
        retry_count = 0

        # index content with Tika, if available
        tika_url = api.portal.get_registry_record("tika_url", ITypesenseSettings)
        tika_timeout = api.portal.get_registry_record("tika_timeout", ITypesenseSettings)
        if not tika_url:
            return indexable_content

        # save indexable content to temporary file
        tmp_fn = tempfile.mktemp()
        with open(tmp_fn, "wb") as fp:
            fp.write(self.context.file.data)

        # send temporary file to Apache Tika
        while retry_count < max_retries:
            try:
                parsed = tika.parser.from_file(tmp_fn, serverEndpoint=tika_url, requestOptions={'timeout': tika_timeout})
                indexable_content["text"] += parsed["content"]
                logger.info(f'Success fileobject: {self.context.file.filename} was extracted by tika.')
                print(f'Success fileobject: {self.context.file.filename} was extracted by tika.')
                os.unlink(tmp_fn)
                return indexable_content
            except:
                logger.exception(f'Error fileobject: {self.context.file.filename} could not be indexed, retry in {retry_delay} seconds.')
                print(f'Error fileobject: {self.context.file.filename} could not be indexed, retry in {retry_delay} seconds.')
                #LOG.exception("Unable to interact with Tika", exc_info=True)

            retry_count += 1
            retry_delay *= 2
            time.sleep(retry_delay)    

        logger.exception(f'Max retries reached. Unable to establish a connection to the Apache Tika server for fileobject: {self.context.file.filename}')
        print(f'Max retries reached. Unable to establish a connection to the Apache Tika server for fileobject: {self.context.file.filename}')
        os.unlink(tmp_fn)

        return indexable_content
