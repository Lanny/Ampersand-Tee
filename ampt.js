;(function() {
  var bbcTags = {
    'img': null,
    'quote': null,
    'i': null,
    'url': null
  }

  function extend(o1, o2) {
    // Copies all of the properties on o2 but no o1 onto o1
    for (attr in o2) {
      if (o1[attr] === undefined)
        o1[attr] = o2[attr]
    }
  }

  function BBCNode(name, attrs, children) {
    this.name = name
    this.attrs = attrs || {}
    this.children = children || []
  }

  BBCNode.prototype = {
    addChild: function(child) {
      this.children.push(child)
    },
    toString: function() {
      var s = '[' + this.name

      for (attr in this.attrs)
        s += ' ' + attr + '=' + this.attrs[attr]

      s += ']'

      for (var i=0; i<this.children.length; i++) {
        s += this.children[i].toString()
      }

      s += '[/' + this.name  + ']'

      return s
    }
  }

  function RootNode() {
    this.children = []
    this.attrs = {}
    this.name = '#root'
  }

  RootNode.prototype = {
    toString: function() {
      var s = ''
      for (var i=0; i<this.children.length; i++)
        s += this.children[i].toString()

      return s
    }
  }
  extend(RootNode.prototype, BBCNode.prototype)


  function TextNode(text) {
    this.text = text
    this.children = []
    this.attrs = []
    this.name = '#text'
  }
  TextNode.prototype = {
    toString: function() { return this.text },
    addChild: function() { throw "Can not add children to text nodes" }
  }
  extend(TextNode.prototype, BBCNode.prototype)


  function Parser(text) {
    this.i = 0
    this.text = text
  }
  Parser.prototype = {
    parse: function() {
      var root = new RootNode()

      while (!(this.i == this.text.length)) {
        root.addChild(this.parseNode())
      }

      return root
    },
    parseNode: function() {
      var tag = this.nextTag()
      if (tag) {
        return this.parseBBCTag(tag)
      } else {
        return this.parseText()
      }
    },
    parseBBCTag: function(openTag) {
      var node = new BBCNode(openTag.name, openTag.attrs),
        possibleCloser

      while (this.i < this.text.length) {
        possibleCloser = this.nextTag(true)
        if (possibleCloser
            && possibleCloser.name == openTag.name
            && possibleCloser.closer) {
          this.nextTag() // just to advance `this.i`
          break
        }

        node.addChild(this.parseNode())
      }

      return node
    },
    parseText: function() {
      var start = this.i

      for (; this.i<this.text.length; this.i++) {
        if (this.nextTag(true)) break
      }
      return new TextNode(this.text.substr(start, this.i-start))
    },
    nextTag: function(noAdvance) {
      /* Attempts to parse the next BBC opener tag and returns an object with
       * `name` and `attrs` keys if the next string from this.i is valid. If
       * it's not then return null and do not advance this.i. If noAdvance is
       * true then this.i will not be advanced even if we parse a tag. */
      var start = this.i,
          tag = {}

      if (this.text[start++] != '[')
        return null

      if (this.text[start] == '/') {
        tag.closer = true
        start++
      }

      for (var i=start; i<this.text.length; i++) {
        if (this.text[i].match(/\W/) && !tag.name) {
          tag.name = this.text.substr(start, i-start)

          if (!(tag.name in bbcTags))
            return null
        }

        if (this.text[i] == ']') {
          if (!noAdvance) this.i = i+1
          return tag
        }
      }

      return null
    }
  }

  ampt = {
    parse: function(text) {
      return (new Parser(text)).parse()
    }
  }

  if (typeof module !== 'undefined')
    module.exports = ampt
  else if (typeof window !== 'undefined')
    window.ampt = ampt
  else
    throw "Lol, where the hell am I?"
})()
