Changelog
=========

1.0.0 (2025-09-21)
------------------

- Indexierung des Scopes
- Unterbinden der ausgeschlossenen Content-Types
- Berücksichtigung ausgeschlossener Ordner


1.0.0a9 (2025-03-30)
--------------------

- fixed issue in JSON export with U+2028 as line-ending within content
  [zopyx]

- configurable timeout for tika connection
  [lwalther]

- erros during tika connections dont break indexing
  [lwalther]

- basic auth handling for tika server connections
  [lwalther]

- some fixes or error handlings for special situations
  [lwalther]

1.0a8 (2022-07-03)
------------------

- fixed normalization in document_path()
  [zopyx]

- changed column ordering for "demo search" in control panel
  [zopyx]

- added integration with toolbar
  [zopyx]

- updated for Typesense 0.23.0
  [zopyx]

- support incremental schema change without collection recreation
  [zopyx]



1.0a7 (2022-02-26)
------------------
- updated docs
  [zopyx]

1.0a6 (2022-02-19)
------------------
- hide/show search results/stats based on search input state
  [zopyx]
- support for indexing HTML headlines (h1-h6 tags) into a dedicated
  field
  [zopyx]
- highlighting support for title | headlines | text with query
  weights 4:2:1
  [zopyx]


1.0a1 (2022-02-13)
------------------

- Initial release.
  [zopyx]
