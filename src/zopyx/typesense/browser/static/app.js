/* global instantsearch */

/* global vars first */
var remote_url = PORTAL_URL + "/@@typesense-search-settings";
var ts_settings = null;

/* Show initially all hits with all form control (true)
 * or show only empty search field by default (false).
 */
var SHOW_ALL_HITS_INITIALLY = true;

/* Retrieve search settings through JSON */
function getSearchSettings() {
    return $.getJSON({
        type: "GET",
        url: remote_url,
        async: false
    }).responseText;
}

ts_settings = JSON.parse(getSearchSettings());
console.log(ts_settings);

var filterBy = '';
if (CURRENT_PATH.length > 1) // root = "/"
    filterBy = `all_paths:=${CURRENT_PATH}`;

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
    server: {
        apiKey: ts_settings["api_key"],
        nodes: ts_settings["nodes"]
    },
    // The following parameters are directly passed to Typesense's search API
    // endpoint.  So you can pass any parameters supported by the search
    // endpoint below.  queryBy is required.  filterBy is managed and
    // overridden by InstantSearch.js. To set it, you want to use one of the
    // filter widgets like refinementList or use the `configure` widget.
    additionalSearchParameters: {
        queryBy: ts_settings["query_by"],
        queryByWeights: ts_settings["query_by_weights"],
        filterBy: filterBy
    },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;

const search = instantsearch({
    searchClient,
    indexName: ts_settings["collection"],
    searchFunction(helper) {
        if (! SHOW_ALL_HITS_INITIALLY) {
            if (helper.state.query === '') {
                $('.refinement-label').hide();
                $('.ais-RefinementList-list').hide();
                $('#search-control').hide();
                $('#hits').hide();
            } else {
                $('.refinement-label').show();
                $('.ais-RefinementList-list').show();
                $('#search-control').show();
                $('#hits').show();
                helper.search();
            }
        } else {
                helper.search();
        }
    }
});

/*
 * Example:
 * https://github.com/typesense/showcase-ecommerce-store/blob/master/src/app.js
 */

const filter_list = []
filter_list.push(ts_settings["portal_id"]);
ts_settings["external_portal_ids"].forEach((portal) => filter_list.push(portal));
const filters = filter_list.map(portal => `portal:${portal}`).join(' OR ');
//search.setQueryParameter('filters', filters);

search.addWidgets([
    instantsearch.widgets.searchBox({
        container: '#searchbox',
        showSubmit: false,
        showReset: false,
        placeholder: 'Suchbegriff eingeben... ',
        autofocus: false,
        searchAsYouType: true,
        showLoadingIndicator: true,
        cssClasses: {
            input: 'form-control form-control-sm border border-light text-dark',
            loadingIcon: 'stroke-primary',
        },
    }),
    instantsearch.widgets.configure({
        hitsPerPage: 10,
    }),
    instantsearch.widgets.hits({
        container: '#hits',
        templates: {
            item: `
          <div class="hit">
            <div class="hit-title"> <a class="hit-link" href="{{#helpers.highlight}}{ "attribute": "absolute_url" }{{/helpers.highlight}}\">{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</a></div>
            <div class="hit-meta">
                <span class="hit-portal_type">{{#helpers.highlight}}{ "attribute": "portal_type" }{{/helpers.highlight}}</span> |
                <span class="hit-review_state">{{#helpers.highlight}}{ "attribute": "review_state" }{{/helpers.highlight}}</span> |
                <span class="hit-created">{{#helpers.highlight}}{ "attribute": "created" }{{/helpers.highlight}}</span> |
                <span class="hit-modified">{{#helpers.highlight}}{ "attribute": "modified" }{{/helpers.highlight}}</span>
            </div>
            <!--
            <div class="hit-text">{{#helpers.highlight}}{ "attribute": "text" }{{/helpers.highlight}}</div>
            -->
            <div class="hit-text" id="hits-headlines">{{#helpers.snippet}}{ "attribute": "headlines" }{{/helpers.snippet}}</div>
            <div class="hit-text" id="hits-text">{{#helpers.snippet}}{ "attribute": "text" }{{/helpers.snippet}}</div>
          </div>
`,
        },
    }),
    /*
    instantsearch.widgets.index({
        searchClient,
        indexName: 'onko',
        searchFunction(helper) {
            if (! SHOW_ALL_HITS_INITIALLY) {
                if (helper.state.query === '') {
                    $('.refinement-label').hide();
                    $('.ais-RefinementList-list').hide();
                    $('#search-control').hide();
                    $('#hits').hide();
                } else {
                    $('.refinement-label').show();
                    $('.ais-RefinementList-list').show();
                    $('#search-control').show();
                    $('#hits').show();
                    helper.search();
                }
            } else {
                    helper.search();
            }
        }
    })
    .addWidgets([
        instantsearch.widgets.hits({
            container: '#hits',
            templates: {
                item: `
              <div class="hit">
                <div class="hit-title"> <a class="hit-link" href="{{#helpers.highlight}}{ "attribute": "absolute_url" }{{/helpers.highlight}}\">{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</a></div>
                <div class="hit-meta">
                    <span class="hit-portal_type">{{#helpers.highlight}}{ "attribute": "portal_type" }{{/helpers.highlight}}</span> |
                    <span class="hit-review_state">{{#helpers.highlight}}{ "attribute": "review_state" }{{/helpers.highlight}}</span> |
                    <span class="hit-created">{{#helpers.highlight}}{ "attribute": "created" }{{/helpers.highlight}}</span> |
                    <span class="hit-modified">{{#helpers.highlight}}{ "attribute": "modified" }{{/helpers.highlight}}</span>
                </div>
                <!--
                <div class="hit-text">{{#helpers.highlight}}{ "attribute": "text" }{{/helpers.highlight}}</div>
                -->
                <div class="hit-text" id="hits-headlines">{{#helpers.snippet}}{ "attribute": "headlines" }{{/helpers.snippet}}</div>
                <div class="hit-text" id="hits-text">{{#helpers.snippet}}{ "attribute": "text" }{{/helpers.snippet}}</div>
              </div>
    `,
            },
        }),
    ]),
    */

    instantsearch.widgets.pagination({
        container: '#pagination',
        root: "nav",
        cssClasses: {
            root: "navigation",
            list: 'pagination ',
            item: 'page-item ',
            link: 'text-decoration-none',
            disabledItem: 'text-muted',
            selectedItem: 'fw-bold text-primary',
        },

    }),
    /* instantsearch.widgets.refinementList({
        container: '#review-state',
        attribute: 'review_state',
    }), */
    instantsearch.widgets.refinementList({
        container: '#portal-id',
        attribute: 'portal_id',
        showMore: false
    }),
    instantsearch.widgets.refinementList({
        container: '#portal-type',
        attribute: 'portal_type',
        showMore: false
    }),
    instantsearch.widgets.refinementList({
        container: '#subject',
        attribute: 'subject',
    }),
    /* instantsearch.widgets.refinementList({
        container: '#language',
        attribute: 'language',
    }),*/

    instantsearch.widgets.stats({
        container: '#stats',
        templates: {
            text: `
      {{#hasNoResults}}Keine Treffer{{/hasNoResults}}
      {{#hasOneResult}}1 Treffer{{/hasOneResult}}
      {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} Treffer {{/hasManyResults}}
      gefunden in {{processingTimeMS}} ms
    `,
        },
        cssClasses: {
            text: 'small',
        },
    }),

    instantsearch.widgets.hitsPerPage({
        container: '#hits-per-page',
        items: [{
            label: '10 pro Seite',
            value: 10,
            default: true
        }, {
            label: '20 pro Seite',
            value: 20
        }, {
            label: '50 pro Seite',
            value: 50
        }, {
            label: '100 pro Seite',
            value: 100
        }, ],
        cssClasses: {
            select: 'custom-select custom-select-sm',
        },
    }),
]);

search.start();
