import React from 'react'
import PropTypes from 'prop-types'
import { staticBadgeUrl } from '../../lib/badge-url'
import { badgeUrlFromPath } from '../../../lib/make-badge-url'
import generateAllMarkup from '../../lib/generate-image-markup'
import { advertisedStyles } from '../../../supported-features.json'
import { Snippet2 } from '../snippet'
import { H3, Badge } from '../common'
import PathBuilder from './path-builder'
import QueryStringBuilder from './query-string-builder'

const WeeSnippet = ({ snippet }) => (
  <Snippet2 truncate fontSize="10pt" snippet={snippet} />
)
WeeSnippet.propTypes = {
  snippet: PropTypes.string.isRequired,
}

export default class MarkupModalContent extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
  }

  state = {
    path: '',
    link: '',
    style: 'flat',
  }

  generateBuiltBadgeUrl() {
    const { baseUrl } = this.props
    const { path, style } = this.state

    return badgeUrlFromPath({
      baseUrl,
      path,
      style: style === 'flat' ? undefined : style,
    })
  }

  renderLivePreview() {
    const { baseUrl } = this.props
    const { isComplete } = this.state
    let src
    if (isComplete) {
      src = this.generateBuiltBadgeUrl()
    } else {
      src = staticBadgeUrl(
        baseUrl,
        'preview',
        'some parameters missing',
        'lightgray'
      )
    }
    return (
      <p>
        Live preview&nbsp;
        <Badge display="block" src={src} />
      </p>
    )
  }

  renderMarkup() {
    const {
      example: {
        example: { title },
      },
    } = this.props
    const { link } = this.state

    const builtBadgeUrl = this.generateBuiltBadgeUrl()
    const { markdown, reStructuredText, asciiDoc } = generateAllMarkup(
      builtBadgeUrl,
      link,
      title
    )

    return (
      <div>
        <p>
          URL&nbsp;
          <WeeSnippet snippet={builtBadgeUrl} />
        </p>
        <p>
          Markdown&nbsp;
          <WeeSnippet snippet={markdown} />
        </p>
        <p>
          reStructuredText&nbsp;
          <WeeSnippet snippet={reStructuredText} />
        </p>
        <p>
          AsciiDoc&nbsp;
          <WeeSnippet snippet={asciiDoc} />
        </p>
      </div>
    )
  }

  renderDocumentation() {
    const {
      example: { documentation },
    } = this.props

    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null
  }

  renderFullPattern() {
    const {
      baseUrl,
      example: {
        example: { pattern },
      },
    } = this.props
    return (
      <Snippet2
        snippet={pattern}
        snippetToCopy={`${baseUrl}${pattern}.svg`}
        fontSize="9pt"
      />
    )
  }

  handlePathChange = ({ path, isComplete }) => {
    this.setState({ path, isComplete })
  }

  handleQueryParamChange = ({ queryParams }) => {
    this.setState({ queryParams })
  }

  render() {
    const {
      example: {
        title,
        example: { pattern, namedParams, queryParams },
      },
    } = this.props
    const { style } = this.state
    const hasQueryParams = Boolean(Object.keys(queryParams).length)

    return (
      <form action="">
        <H3>{title}</H3>
        <PathBuilder
          pattern={pattern}
          exampleParams={namedParams}
          onChange={this.handlePathChange}
        />
        {hasQueryParams && (
          <QueryStringBuilder
            exampleParams={queryParams}
            onChange={this.handleQueryParamChange}
          />
        )}
        <p>
          <label>
            Style&nbsp;
            <select
              value={style}
              onChange={event => {
                this.setState({ style: event.target.value })
              }}
            >
              {advertisedStyles.map(style => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
        </p>
        {this.renderLivePreview()}
        {this.renderMarkup()}
        {this.renderDocumentation()}
        {this.renderFullPattern()}
      </form>
    )
  }
}
