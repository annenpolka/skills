# Code Patterns Catalog

A reference of common patterns and anti-patterns to look for during investigation.
Subagents should read the section relevant to the detected language/framework.

## Table of Contents
- [Universal Patterns](#universal-patterns)
- [TypeScript / JavaScript](#typescript--javascript)
- [Python](#python)
- [Go](#go)
- [Rust](#rust)

---

## Universal Patterns

### Architecture Patterns (look for these)

| Pattern | Grep Signals | Implications |
|---------|-------------|-------------|
| Layered / MVC | `controller`, `service`, `repository`, `model` directories | Clear separation, but watch for leaky abstractions |
| Hexagonal | `ports/`, `adapters/`, `domain/`, `infrastructure/` | Good isolation, may be over-engineered for simple apps |
| Event-driven | `emit`, `publish`, `subscribe`, `on(`, `EventEmitter` | Loose coupling, but hard to trace flow |
| CQRS | `command`, `query`, `read-model`, `write-model` | Scalable reads/writes, high complexity |
| Microservices | Multiple `Dockerfile`, API gateway config, service discovery | Independent deployment, distributed complexity |

### Anti-Patterns (watch for these)

| Anti-Pattern | Grep Signals | Impact |
|-------------|-------------|--------|
| God class/module | Single file >500 LOC with many methods | Hard to test, modify, understand |
| Circular dependencies | Mutual imports between modules | Build issues, tight coupling |
| Stringly-typed | `string` used where enum/union would be better | Runtime errors, no autocomplete |
| Copy-paste code | Near-identical blocks across files | Maintenance burden, inconsistent fixes |
| Premature abstraction | Abstract class with single implementor | Complexity without benefit |
| Magic numbers | Literal numbers in business logic | Unclear intent, hard to change |

---

## TypeScript / JavaScript

### Positive Patterns
- **Strict TypeScript**: `"strict": true` in tsconfig, minimal `any` usage
- **Barrel exports**: `index.ts` re-exporting module's public API
- **Path aliases**: `@/` or `~/` prefix for absolute imports
- **Zod/io-ts schemas**: Runtime validation matching TypeScript types
- **Discriminated unions**: `type Result = Success | Failure` with `kind` field

### Grep Targets
```
# Type safety issues
any                          # Count occurrences — high count = type safety debt
as unknown as               # Dangerous type assertions
@ts-ignore                  # Suppressed type errors
@ts-expect-error            # Intentional type workarounds

# Error handling
catch\s*\(\s*\)             # Empty catch (swallowed errors)
catch\s*\(e\)\s*\{[\s\n]*\} # Catch with no body
\.catch\(\s*\(\)            # Promise catch with no handler

# Async patterns
await.*await                # Potential waterfall (could be parallel)
new Promise                 # Manual promise construction (often unnecessary)
callback                    # Callback patterns (might need promisification)
```

### Framework-Specific (React)
```
useEffect\(\s*\(\)\s*=>     # Effects — check for cleanup, deps array
useState                    # Count — too many useState = needs useReducer
any.*Props                  # Untyped props
dangerouslySetInnerHTML     # XSS risk
```

---

## Python

### Positive Patterns
- **Type hints**: `def func(x: int) -> str:` consistently used
- **Dataclasses / Pydantic models**: Structured data over raw dicts
- **Context managers**: `with` for resource management
- **Abstract base classes**: Clear interface contracts
- **Pytest fixtures**: Reusable test setup

### Grep Targets
```
# Type safety
: Any                       # Escape hatch from type system
type: ignore                # Suppressed type errors
cast(                       # Type casting

# Error handling
except:                     # Bare except (catches everything including KeyboardInterrupt)
except Exception:            # Overly broad exception catching
pass                        # In except blocks — swallowed errors

# Code quality
global                      # Global state mutation
import *                    # Wildcard imports (namespace pollution)
eval(                       # Code execution risk
exec(                       # Code execution risk
pickle                      # Deserialization risk
```

---

## Go

### Positive Patterns
- **Interface-driven design**: Small interfaces, dependency injection
- **Error wrapping**: `fmt.Errorf("context: %w", err)` for error chains
- **Table-driven tests**: `tests := []struct{...}` pattern
- **Context propagation**: `ctx context.Context` as first parameter
- **Functional options**: `WithTimeout(5)` style configuration

### Grep Targets
```
# Error handling
if err != nil               # Count — should be present after every fallible call
_ = .*err                   # Ignored errors (dangerous)
panic(                      # Should be rare outside init()
log.Fatal                   # Exits process — appropriate?

# Concurrency
go func                     # Goroutine spawning — check for leaks
sync.Mutex                  # Locking — check for deadlock potential
chan                         # Channel usage — buffered vs unbuffered

# Code quality
interface\s*\{[\s\n]*\}     # Empty interfaces (like `any`)
init()                      # Init functions — side effects at import time
```

---

## Rust

### Positive Patterns
- **Result/Option chaining**: `?` operator, `map`, `and_then`
- **Derive macros**: `#[derive(Debug, Clone, Serialize)]`
- **Module visibility**: `pub(crate)` for internal APIs
- **Error crates**: `thiserror`, `anyhow` for structured error handling
- **Builder pattern**: For complex struct construction

### Grep Targets
```
# Safety concerns
unsafe                      # Count and review each usage
unwrap()                    # Panics on None/Err — risky in production
expect(                     # Panics with message — slightly better than unwrap
clone()                     # Excessive cloning — performance concern
Box<dyn                     # Dynamic dispatch — performance trade-off

# Code quality
todo!()                     # Unfinished code
unimplemented!()            # Placeholder implementations
#[allow(                    # Suppressed warnings — review each
dead_code                   # Unused code not cleaned up
```
