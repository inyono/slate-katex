import katex from 'katex'
import React, { Component } from 'react'
import { Editor, Raw } from 'slate'

import 'katex/dist/katex.min.css'

const initialState = {
  nodes: [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          ranges: [
            {
              text: 'Write some stuff'
            }
          ]
        }
      ]
    }
  ]
}

class Katex extends Component {
  constructor(props) {
    super(props)
    this.timer = null
  }

  componentDidMount() {
    this.update(this.props.src)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.update(nextProps.src)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
    this.timer = null
  }

  update(src) {
    const { displayMode, throwOnError, errorColor } = this.props

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      try {
        const html = katex.renderToString(
          (src && src.length > 0) ? src : '\\text{empty formula}', {
            displayMode,
            throwOnError,
            errorColor
          }
        )

        this.setState({
          __html: html
        })
      } catch (e) {
        console.error(e)
      }
    }, 0)
  }

  render() {
    return (
      <span dangerouslySetInnerHTML={this.state} />
    )
  }
}

Katex.defaultProps = {
  displayMode: false,
  src: '',
  throwOnError: false,
  errorColor: '#cc0000'
}

const LaTeX = ({ attributes, children, node }: { attributes: Object, children: any, node: { data: any } }) => {
  const { data } = node
  const src = data.get('src')

  return (
    <span {...attributes}><Katex src={src} />{children}</span>
  )
}

const schema = {
  nodes: {
    MATH: LaTeX
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      state: Raw.deserialize(initialState, { terse: true })
    }

    this.insertMath = (e) => {
      e.preventDefault()
      let { state } = this.state
      const hasMath = state.inlines.some((inline: any) => inline.type === 'MATH')

      if (hasMath) {
        state = state
          .transform()
          .unwrapInline('MATH')
          .apply()
      } else {
        const src = window.prompt('Enter your LaTeX:')
        state = state
          .transform()
          .insertText(' ')
          .insertInline({
            isVoid: true,
            data: { src },
            type: 'MATH'
          })
          .insertText(' ')
          .apply()
      }

      this.setState({ state })
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.insertMath}>Insert Math</button>
        <Editor schema={schema}
                state={this.state.state}
                onChange={(state) => this.setState({ state })} />
      </div>
    )
  }
}

export default App
