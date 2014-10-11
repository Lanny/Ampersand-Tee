var TC1 = "[quote author=Lanny date=1234]hai[/quote]\n\nhai2u!"

test("Structure validity", function() {
  var p = ampt.parse(TC1)
  equal(p.name, '#root', '`parse` returns a RootNode tree.')
  equal(p.children.length, 2, 'TC1 produces two top level children')
  equal(p.children[0].name, 'quote', 'TC1 produces a quote node')
  equal(p.children[1].name, '#text', 'TC1 produces a text node')
})
