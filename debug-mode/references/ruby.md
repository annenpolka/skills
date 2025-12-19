# Ruby

Debug Mode instrumentation patterns for Ruby.

## One-liner

```ruby
# region debug:H1
File.open('debug.log','a'){|f|f.puts({h:'H1',l:'label',v:{key:value},ts:(Time.now.to_f*1000).to_i}.to_json)}
# endregion
```

## Expanded

```ruby
# region debug:H1
require 'json'

File.open('debug.log', 'a') do |f|
  f.puts({
    h: 'H1',
    l: 'user_state',
    v: { user_id: user.id, cart: cart.to_h },
    ts: (Time.now.to_f * 1000).to_i
  }.to_json)
end
# endregion
```
