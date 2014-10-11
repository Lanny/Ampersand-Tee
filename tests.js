var TC1 = "[quote author=Lanny date=1234]hai[/quote]\n\nhai2u!"

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
      tag, p

  p = new ampt._Parser(sTC1)
  tag = p.nextTag()
  deepEqual({author: "Lanny", date: "1234"}, tag.attrs,
            'sTC1\'s attributes are extracted correctly')

  p = new ampt._Parser(sTC2)
  tag = p.nextTag()
  deepEqual({author: "Lanny Is My Handle", date: "1234"}, tag.attrs,
            'attr values with spaces are not split')

  p = new ampt._Parser(sTC3)
  tag = p.nextTag()
  deepEqual({author: "Lanny Is My Handle", date: "1234"}, tag.attrs,
            'attr values within quotes are not split and are stripped')

  p = new ampt._Parser(sTC4)
  tag = p.nextTag()
  deepEqual({author: "Lanny Is My Handle date=1234", date: "1234"}, tag.attrs,
            'attr key/value pairs within quotes are not treated as such')

  p = new ampt._Parser(sTC5)
  tag = p.nextTag()
  deepEqual({}, tag.attrs, 'tags with no attrs are handled OK.')
})
