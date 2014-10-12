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

  p = new ampt._Parser(sTC1)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny", date: "1234"},
            'sTC1\'s attributes are extracted correctly')

  p = new ampt._Parser(sTC2)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle", date: "1234"},
            'attr values with spaces are not split')

  p = new ampt._Parser(sTC3)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle", date: "321"},
            'attr values within quotes are not split and are stripped')

  p = new ampt._Parser(sTC4)
  tag = p.nextTag()
  deepEqual(tag.attrs, {author: "Lanny Is My Handle date=123", date: "321"},
            'attr key/value pairs within quotes are not treated as such')

  p = new ampt._Parser(sTC5)
  tag = p.nextTag()
  deepEqual(tag.attrs, {}, 'tags with no attrs are handled OK.')

  p = new ampt._Parser(sTC6)
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

