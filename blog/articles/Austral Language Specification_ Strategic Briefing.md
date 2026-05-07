### Austral Language Specification: Strategic Briefing

#### Executive Summary

Austral is a systems programming language engineered to prioritize security, readability, and long-term maintainability. Its primary innovation is the integration of a  **linear type system** , which enables manual memory management and resource lifecycle enforcement without the overhead of a garbage collector or the complexity of traditional static analysis heuristics.The language is governed by the principle of  **"fits-in-head simplicity,"**  defined by low Kolmogorov complexity. It deliberately rejects features that introduce "surprise" control flow, such as exception handling, in favor of a "scuttle the ship" approach to contract violations: terminating the program immediately to prevent security vulnerabilities.Austral facilitates  **Capability-Based Security** , requiring code to possess unforgeable linear tokens to access sensitive resources like the filesystem or network. This architecture aims to mitigate supply chain attacks by making a library's permissions explicit in its function signatures.

#### Core Design Philosophy

The development of Austral is guided by several "strict" and often contrarian design goals:

* **Simplicity:**  The language must be small enough to be understood entirely by a single person. Simplicity is not "friendliness" but the ability for a system to be described briefly.  
* **Restraint:**  Austral assumes human error is inescapable. It favors mechanical aids (type systems, formal verification, static assertions) over human processes like code review.  
* **Strictness:**  Described as "crystalline and brittle," Austral is designed so that minor changes break the build rather than introducing silent bugs.  
* **Maintainability:**  The goal is for code written today to compile and run decades into the future by prioritizing stability and saying "no" to trendy features.  
* **Readability over Writability:**  Optimizing for the reader by using English keywords rather than inscrutable symbols (e.g., and instead of &&).

#### The Linear Type System

The cornerstone of Austral’s safety model is its linear type system, which ensures resources (memory, file handles, database connections) are used exactly once.

##### The Two Universes

Austral divides all types into two universes:

1. **Free:**  Types that can be copied or discarded any number of times (e.g., integers, booleans).  
2. **Linear:**  Types that represent restricted resources. They must be consumed exactly once.

##### The Use-Once Rule

A variable of a linear type cannot be used zero times (a leak) or more than once (double-free/use-after-free).

* **Conditionals:**  A linear variable defined outside an if statement must be consumed in every branch or none at all.  
* **Loops:**  Linear variables defined outside a loop cannot be used inside the loop body, as they would be consumed multiple times across iterations.

##### Safety Benefits

By enforcing the resource lifecycle at the type level, Austral prevents:

* **Memory Leaks:**  Forgetting to deallocate memory.  
* **Use-After-Free:**  Accessing a pointer after it has been freed.  
* **Double-Free:**  Deallocating the same pointer twice.  
* **Resource Mismanagement:**  Forgetting to close sockets or database handles.

##### The Trust Boundary

Internal implementations of linear types often use "unsafe" non-linear code (like C FFI) wrapped in a linear interface. This "Trust Boundary" ensures that while the interior may be complex, the exterior interface is mathematically guaranteed to be used correctly by clients.

#### Syntax and Module System

Austral adopts a statement-oriented syntax inspired by the Wirth tradition (Algol, Pascal, Ada) rather than the C tradition.

##### Syntactic Features

* **Keyword Delimiters:**  Constructs end with specific keywords like end if or end for, making deeply nested code easier to navigate without IDE support.  
* **Statement Orientation:**  Forces code to be structurally simple, discouraging "clever" or obfuscated expression-heavy code.  
* **Redundancy:**  Semicolons are used not just as terminators but to provide redundancy that aids in parser error recovery.

##### Modularity

Modules are the fundamental unit of organization, strictly split into:

* **Module Interface:**  Contains public declarations (opaque constants, record/union definitions, function signatures).  
* **Module Body:**  Contains private implementation details and constant definitions.  
* **Parallel Implementation:**  A module can be type-checked against the  *interface*  of its dependencies before those dependencies are even implemented.

#### Error Handling: The "Scuttle the Ship" Model

Austral rejects traditional exception handling (REOE \- Raise Exception on Error) in favor of  **Terminate Program on Error (TPOE)**  for contract violations.

##### Critique of Exception Handling

The specification identifies 15 distinct problems with traditional exceptions, including:

1. **Complexity:**  Exceptions introduce "surprise control flow" at every program point.  
2. **Incompatibility:**  Linear types cannot easily coexist with stack unwinding, as throwing an exception would leak all linear variables currently in scope.  
3. **The Double-Throw Problem:**  If a destructor throws while the stack is already unwinding, most systems must abort anyway.  
4. **Invisible Costs:**  Destructor calls are hidden function calls that increase binary size and complicate performance analysis.

##### Categorization of Failures

Category,Handling Strategy  
Physical/Machine Failure,Nothing can be done; terminate.  
Contract Violations,Terminate program immediately (TPOE).  
Memory Allocation Failure,Return Option or Result types.  
Expected Failure Conditions,Use standard control flow with Option and Either types.

#### Capability-Based Security

To combat supply chain attacks, Austral utilizes linear types to implement a capability-based security model.

* **The Concept:**  A capability is an unforgeable proof of authority to perform an action.  
* **Linear Enforcement:**  Because capabilities are linear values, they cannot be duplicated or acquired "out of thin air."  
* **The Root Capability:**  The entry point of an Austral program receives a RootCapability. All other restricted actions (accessing the filesystem, network, or clock) must be derived from this root or its children.  
* **FFI and Unsafe Modules:**  Guarantees are maintained by marking modules that use the FFI as Unsafe\_Module. This allows developers to audit a small, explicit list of modules that bridge the gap between the capability-secure Austral code and the permissionless outside world.

#### Technical Specifications

##### Built-In Types

Name,Description,Universe  
Unit,Returns no value (constant: nil).,Free  
Bool,"Logical operators (true, false).",Free  
Nat8-64,Unsigned integers of various widths.,Free  
Int8-64,Signed integers of various widths.,Free  
Reference,Read-only reference bound to a region.,Free  
FixedArray,Arrays with size fixed at runtime.,Free  
RootCapability,The top-level permission token.,Linear

##### Type Classes and Instances

Austral implements a form of ad-hoc polymorphism via Type Classes (similar to Haskell).

* **Instance Uniqueness:**  Instances must be globally unique to prevent ambiguity.  
* **Coherence Rules:**  You can only define an instance if either the typeclass or the type is local to the module.

##### C Interface Mapping

Austral provides direct mapping to C types for FFI: | C Type | Austral Equivalent | | :--- | :--- | | unsigned char | Bool or Nat8 | | unsigned int | Nat32 | | double | Float64 | | t\* | Addresst |

##### Memory Management Primitives (Austral.Memory)

* allocateT: Allocates memory for a single value.  
* loadT: Dereferences a pointer.  
* storeT: Writes a value to a pointer location.  
* deallocateT: Explicitly frees memory, consuming the linear pointer.

#### Conclusion

Austral is designed for "pyramid building"—static, imposing, and rigid structures. By sacrificing programmer ergonomics (such as terseness and exceptions) for simplicity and correctness, it provides a unique environment for systems where security and long-term stability are the highest priorities.  
