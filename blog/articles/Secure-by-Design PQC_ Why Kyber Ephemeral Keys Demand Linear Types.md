### Secure-by-Design PQC: Why Kyber Ephemeral Keys Demand Linear Types

#### 1\. Introduction: The Quantum Imperative and the Resource Lifecycle

The transition to Post-Quantum Cryptography (PQC) represents a fundamental shift in how we secure digital infrastructure against quantum-enabled cryptanalysis. Algorithms like Kyber—a lattice-based Key Encapsulation Mechanism (KEM)—rely on complex mathematical foundations. However, the strategic implementation of these algorithms requires more than just mathematical hardness; it demands a paradigm shift in how software architectures treat cryptographic material. In high-assurance systems, keys must be treated as strict  **resources**  with mandatory lifecycles, rather than simple, unrestricted data.In the context of the Kyber algorithm, "ephemeral keys" (such as the Secret Key, or sk) are short-lived materials generated to establish session secrets. Because these keys are designed to exist only for a transient period, their security depends entirely on rigorous lifecycle management. The central thesis of this document is that the safety of these keys is not merely a function of the algorithm’s computational hardness, but a matter of  **language-enforced lifecycle management** . By utilizing the design goals of the Austral programming language, we can move beyond manual memory management toward a model of structural correctness.

#### 2\. The Foundations of Linear Logic in System Security

To build truly secure cryptographic systems, we must adopt a "Simplicity-first" and "Correctness-first" design philosophy. Simplicity is the  *sine qua non*  of secure engineering: a system is simple when it can be described briefly and fits entirely within a single developer’s mental model. This simplicity enables "Correctness-first" engineering—if the code compiles, it should work.Austral enforces this through a "brittle" design philosophy. While many languages strive for flexibility, Austral is designed to be strict and rigid. Minor changes that violate security invariants are prone to breaking the build. This "brittleness" is a strategic asset; it ensures that security is not a "best effort" endeavor but a crystalline, compiler-verified reality.

##### The Universes of Types

Austral bifurcates the type system into distinct universes to manage resources:

* **The Free Universe:**  Contains types that can be copied or discarded without restriction (e.g., booleans, integers).  
* **The Linear Universe:**  Contains types representing scarce resources (e.g., Kyber keys, file handles). These follow the  **Use-Once Rule** : a linear value must be used exactly once—never zero times (a leak) and never twice (a double-use).  
* **The**  **Type**  **Kind:**  A "catch-all" kind that accepts types from any universe. When a generic function uses the Type kind, the compiler treats the values as  **Linear**  by default. This is the "lowest common denominator" of behavior, ensuring safety even when the specific universe of a type parameter is unknown.| Feature | Free Universe | Linear Universe | Type Kind (Generic) || \------ | \------ | \------ | \------ || **Categorization** | General data (bools, floats) | Resources (Keys, Pointers) | Unknown/Universal || **Assignment** | Can be copied freely | Ownership is moved; no copies | Treated as Linear || **Function Calls** | Reusable after passing | Consumed upon passing | Consumed upon passing || **Discarding** | Can be silently dropped | Must be explicitly destroyed | Must be explicitly destroyed |

#### 3\. Mapping Kyber Ephemeral Keys to Linear Resources

Implementing Kyber requires viewing a cryptographic key as a  **Resource with a Lifecycle**  (Creation → Use → Destruction). In a linear system, this is managed through "threading": a function that uses a key must return that key back to the caller (alongside its output) to maintain the chain of ownership.

##### The Kyber Key API Lifecycle

Distilled into its critical phases, the Kyber key lifecycle becomes a compiler-checked mandate:

1. **Generation (Creation):**  A SecretKey (sk) is initialized as a linear resource. The compiler ensures this resource is bound to a variable and cannot be ignored.  
2. **Encapsulation/Decapsulation (Use):**  When established via a KEM, the key is threaded through functions. For example, a decapsulate function might take an sk and a Ciphertext (ct), returning a tuple of the SharedSecret and the  *still-linear*  sk. This ensures the key is not lost during the operation.  
3. **Zeroization (Destruction):**  Secure zeroization—overwriting the sk in memory with zeros—is guaranteed by the compiler. Because a linear resource must be explicitly consumed, the programmer is forced to call the destructor, which contains the zeroization logic, before the variable goes out of scope.

##### The Danger of Implicit Lifecycles

In non-linear languages, lifecycles are  **implicit** . A developer might intend to zeroize a key, but a compiler that does not enforce the "Use-Once" rule is inherently prone to cryptographic failure. Without mechanical constraints, security relies on human discipline—a "heuristics and hope" model. Linear types turn these expectations into explicit mandates, eliminating the "So What?" of memory safety by making leaks and double-uses impossible to compile.

#### 4\. Mitigation of Key-Based Attack Vectors

Strategic security relies on proactive mitigation through language constraints rather than reactive, "heuristics-based" static analysis. Linear types provide a static, complete set of rules that catch 100% of lifecycle errors without false negatives.

##### Specific Attacks Mitigated

* **Key Leaks (Forgetting to Zeroize):**  Linearity checking prevents a key from being silently discarded. If a function terminates without consuming the sk, the compiler signals an error.  
* **Double-Use Attacks:**  An ephemeral key must never be used twice. In Austral, the first cryptographic operation "consumes" the variable. Any subsequent attempt to use the same variable results in a compile-time error.  
* **Use-After-Zeroization:**  Once a key is passed to its destructor for zeroization, it enters a "Consumed State." Any further access is blocked by the compiler, preventing undefined behavior.

##### Erroneous Transition Mapping

Erroneous Transition,Cryptographic Equivalent in Kyber PQC  
Forgot to Close,Key Leak:  Sensitive sk material remains in memory indefinitely.  
Double Close,Double Zeroization:  Likely a pointer corruption or logic error.  
Use-After-Close,"Use-After-Zeroization:  Accessing ""dead"" key material."  
Double Use,Key Reuse:  Compromising the uniqueness of the ephemeral exchange.

#### 5\. Implementation and the Trust Boundary

Most PQC implementations (like liboqs) are written in C. This necessitates a  **Trust Boundary** —a strict interface between the high-assurance linear world and the unsafe FFI (Foreign Function Interface).

##### Linear Interface, Non-Linear Interior

To maintain security across the FFI, we use the logic of  **destructuring** . Because you cannot extract a single field from a linear struct without consuming the entire thing, we use a let-destructure sequence:

1. **Explode:**  The linear SecretKey struct is "exploded" into its constituent parts (e.g., a raw internal pointer). This consumes the linear wrapper.  
2. **FFI Call:**  The raw pointer (a Free type) is passed to the unsafe C function.  
3. **Re-wrap or Destroy:**  Once the C operation completes, the raw pointer is immediately re-wrapped into a new linear struct or passed to a destructor for zeroization.This prevents "partial leaks" of key metadata and ensures the internal state never escapes the linear contract.

##### Capability-Based Security and Supply Chain Attacks

Security is further hardened via  **Capability-Based Security** . Access to the system's entropy (CSPRNG) required to seed Kyber's lattice parameters should not be available "out of thin air." Instead, a RootCapability is required.This is a strategic defense against supply chain attacks: a malicious dependency cannot exfiltrate keys or influence key generation if it is never passed the RootCapability or the resulting linear key resources. There is a verifiable chain of authority from the program entry point to the secret material.

#### 6\. Conclusion: The Future of High-Assurance Cryptography

The intersection of Kyber and linear types provides three critical takeaways:

1. **Keys are Resources:**  Cryptographic keys are not data; they are resources with mandatory lifecycles that require mechanical enforcement.  
2. **Structural Security:**  For Kyber to be "Post-Quantum Secure," the implementation must be "Structurally Secure" through the elimination of human error via compiler-enforced linear logic.  
3. **Mechanical Aid over Discipline:**  High-assurance software must move away from "heuristics and hope" toward "fixed rules and formal constraints."By embracing the "brittle" and strict nature of linear types, we ensure that our cryptographic foundations remain unbreakable, not just in theory, but in execution.

