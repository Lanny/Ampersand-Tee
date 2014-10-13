var TC1 = "[quote author=Lanny date=1234]hai[/quote]\n\nhai2u!",
  TC2 = "[quote author=RisiR link=topic=3027.msg39139#msg39139 date=1413136943]\n"
    + "[quote author=helladamnleet date=1413134485]\n"
    + "What amazing [b]Vogon Poetry - The Worst In the Universe[/b]\n"
    + "[/quote]\n"
    + "[quote]Vogon Poetry is by far the worst in the universe. This forum "
    + "includes all forms of literary creative expression. Please post[b]ONLY "
    + "your own work[/b] and try not to flame other users. Bad vogonesque "
    + "poetry, is of course, still welcome here.[/quote]\n"
    + "This is not my work but a 2500 years old fable by Aesop. \n"
    + "[/quote]\n\n"
    + "What are you talking about?"


test("Structure validity", function() {
  var t = ampt.parse(TC1)
  equal(t.name, '#root', '`parse` returns a RootNode tree.')
  equal(t.children.length, 2, 'TC1 produces two top level children')
  equal(t.children[0].name, 'quote', 'TC1 produces a quote node')
  equal(t.children[1].name, '#text', 'TC1 produces a text node')
})

test("Tag attribute extraction", function() {
  var sTC1 = "[quote author=Lanny date=1234]",
      sTC2 = "[quote author=Lanny Is My Handle date=1234]",
      sTC3 = "[quote author=\"Lanny Is My Handle\" date=321]",
      sTC4 = "[quote author=\"Lanny Is My Handle date=123\" date=321]",
      sTC5 = "[quote]",
      sTC6 = "[url=http://lol.com]",
      tag, p

  p = new ampt.Parser(sTC1)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny", date: "1234"},
            'sTC1\'s attributes are extracted correctly')

  p = new ampt.Parser(sTC2)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle", date: "1234"},
            'attr values with spaces are not split')

  p = new ampt.Parser(sTC3)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle", date: "321"},
            'attr values within quotes are not split and are stripped')

  p = new ampt.Parser(sTC4)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle date=123", date: "321"},
            'attr key/value pairs within quotes are not treated as such')

  p = new ampt.Parser(sTC5)
  tag = p.nextTag()
  deepEqual(tag.attrs, {}, 'tags with no attrs are handled OK.')

  p = new ampt.Parser(sTC6)
  tag = p.nextTag()
  deepEqual(tag.attrs, {url: 'http://lol.com'},
            'name-as-attribute tags are recognized as such.')
})

test("Denesting", function() {
  var t = ampt.parse(TC2)
  ampt.denestTags(t, 'quote', 1)

  equal(t.children.length, 2,
        "Denest doesn't change the number of top level elements")
  equal(t.children[0].name, 'quote', 'Denest doesn\'t remove all quotes.')

  var nestedQuotes = t.children[0].children
                      .filter(function(x) { return x.name=='quote' })
  equal(nestedQuotes.length, 0, 'Quotes are actually de-nested')
})

test("Wonkiness", function() {
  var sTC1 = "[u][b]squids[/u][/b]",
      sTC2 = "[u][b]squids [quote]beaches[/u]\n"
             + "[quote]cacti[/quote][/quote][/u][/b]",
      sTC3 = "[u]Wrong without harm"
  t = ampt.parse(sTC1)
  t.print()
  equal(t.children[0].name, 'u', 'sTC1 get underlined')
  equal(t.children[0].children[0].name, 'b', 'sTC1 get bolded')
  
  var nonTextChildren = t.children[0].children[0].children
                         .filter(function(x) { return x.name != '#text' }),
      lastChild = t.children[0].children[0].children[1]
  equal(nonTextChildren.length, 0, 'Orphan closers don\'t become nodes')
  equal(lastChild.text, '[/u]', 'Orphan closers are treated as text.')

  t = ampt.parse(sTC2)
  // Don't even know what I want to test with this one

  t = ampt.parse(sTC3)
  equal(t.children.length, 1, 'sTC3 produces one child')
  equal(t.children[0].name, 'u', 'sTC3 produces an underline node')
  equal(t.children[0].children[0].name, '#text',
        'sTC3 produces underlined text')
  equal(t.children[0].children.length, 1,
        'sTC3\'s underline node has only one child')
})


test("Strict and tag extensions", function() {
  var sTC1 = "this [foo bar=baz]is a[/foo] test",
      extendedTags = extend({foo: null}, ampt.bbcTags)


  var sParse = (new Parser(sTC1, {strict: true})).parse(),
      nsParse = (new Parser(sTC1, {strict: false})).parse(),
      opts = {strict: true, validTags: extendedTags},
      esParse = (new Parser(sTC1, opts)).parse()

  equal(sParse.children.length, 1, "Strict doesn't parse unrecognized tags")
  equal(nsParse.children.length, 3, "Non-strict does parse unrecognized tags")
  equal(sParse.children[0].name, '#text', "Strict treats everything as text")
  equal(nsParse.children[1].name, 'foo',
        "Non-strict picks up on unrecognized names")
  equal(nsParse.children[1].attrs.bar, 'baz',
        "Unrecognized tags get their attrs recognized under non-strict")
  equal(esParse.children[1].name, 'foo',
        "Entended parse picks up on new tag names")

})
