### Understanding the Use-Once Rule: A Primer on Linear Types

##### 1\. The Core Conflict: Digital Copies vs. Physical Reality

In traditional programming, data is treated like a digital ghost: it can be in multiple places at once and can vanish without a trace. When you assign a number to a new variable, you aren't "moving" the data; you are creating an infinite digital copy. However, the physical reality of system resources—like file handles, network sockets, or database connections—does not behave this way.A  **resource**  has a strict lifecycle: it must be opened, used, and eventually closed. Traditional languages fail to respect this because they treat a "file" the same way they treat the number "5"—as something that can be copied at will or forgotten entirely. To bridge this gap, we must adopt a new mental model:  **The Debt Metaphor** . In a linear system, defining a resource is not just creating a variable; it is taking on a "debt" that must be paid back exactly once.| Feature | Standard Variables (Digital) | Resources (Physical) || \------ | \------ | \------ || **Duplication** | Can be copied infinitely (e.g., y \= x). | Forbidden; the resource is unique. || **Disposal** | Can be  **silently discarded**  at any time. | Must be explicitly closed or freed. |  
Because manual resource management relies on the programmer's fallible memory to "pay the debt," it is inherently unpredictable. We need a mechanical aid—a stricter set of rules that forces the compiler to respect the physical nature of resources.

##### 2\. Defining the Use-Once Rule

The  **Use-Once Rule**  is the core of the Austral specification. It mandates that a linear value must be used  **once and only once** . This is a strict requirement: the compiler will reject code where a resource is used zero times or multiple times.To visualize this, consider the three states a linear variable can inhabit:

* **Defined:**  The variable is created (the debt is established) and is ready for use.  
* **Used (Consumed):**  The variable is passed into a function or operation. In Austral, "using" a variable is synonymous with "consuming" it.  
* **Consumed (Invalid):**  Once a variable is consumed, the compiler effectively  **removes the name from the environment** . The debt is paid, and any attempt to use that name again is a compile-time error because the name no longer exists in a valid state.To enforce this, the language must first distinguish between simple data and restricted resources by dividing the type system into two distinct "universes."

##### 3\. The Two Universes: Free vs. Linear

If we treated every single integer and boolean as a linear resource, programming would be an ergonomic nightmare—you would have to manually "thread" every mathematical calculation through your functions. Instead, Austral uses the  **Linear Universe Rule**  to separate data based on its behavior.| Universe | Represents | Duplication | Silently Discarded? || \------ | \------ | \------ | \------ || **Free Universe** | Integers, Booleans, Floats | **Allowed.**  These have no lifecycle. | **Allowed.**  No debt is created. || **Linear Universe** | File handles, Pointers, Capabilities | **Forbidden.**  These represent unique assets. | **Forbidden.**  The debt must be paid. |  
A crucial aspect of this system is the  **virality of linearity** . You cannot "hide" a linear resource inside a free one. If a record contains even a single linear field, the  **entire record becomes linear** . This ensures that resources cannot be accidentally lost or "silently discarded" by burying them inside a standard data structure.

##### 4\. Preventing the "Big Three" Lifecycle Errors

Linearity allows the compiler to catch errors that usually cause catastrophic security vulnerabilities. Using a hypothetical File API, we can see how the Use-Once Rule enforces a correct lifecycle. Note that linear functions which modify a resource must  **return**  that resource (a process called "threading").

* **Leaks (The Zero-Use Violation)**  
* *The Error:*  Opening a resource but never closing it.  
* *The Violation:*  let file1 \= openFile("data.txt"); // Variable 'file1' is never used.  
* *The Result:*  The compiler rejects the code because file1 is  **silently discarded**  rather than consumed by a closing function.  
* **Use-After-Close (The Double-Use Violation)**  
* *The Error:*  Attempting to write to a resource after it has been destroyed.  
* *The Violation:*  closeFile(file1); let file2 \= writeString(file1, "Hello");  
* *The Result:*  The first call (closeFile) consumed file1. The second call tries to use file1 again, but the name was already removed from the environment.  
* **Double-Free (The Double-Use Violation)**  
* *The Error:*  Attempting to destroy the same resource twice.  
* *The Violation:*  closeFile(file1); closeFile(file1);  
* *The Result:*  The second call is a "double-use" of a variable that was already invalidated.By threading the resource—let file2 \= writeString(file1, "...")—the compiler ensures there is always exactly one valid name for the resource until its final destruction.

##### 5\. The "So What?": Why Linearity Matters for the Learner

Human brains were not evolved to simulate complex virtual machines; linear types provide a  **mechanical aid**  that offloads this mental burden to the compiler.

1. **Manual Memory Safety:**  You achieve the high performance of manual memory management (like C) without the risk of "use-after-free" crashes or memory leaks, all without the overhead of a Garbage Collector.  
2. **API Integrity:**  Linearity forces you to follow the intended lifecycle of an API. You cannot skip a step (like flushing a buffer) because the compiler requires you to account for the returned resource at every stage.  
3. **Security and Capability-Based Access:**  This system enables "Capability-Based Security." In a supply chain attack, a compromised library cannot simply open a file or access the network "out of thin air." It must be  *passed*  a linear Capability by the developer. Since capabilities cannot be duplicated, the developer has total control over which library can perform which action.

##### 6\. Summary: The Linear Mental Model

To master linear types, view every linear variable as a physical object and every function call as a hand-off. If you follow the "Debt" checklist below, your code will be structurally sound and secure.

###### *The Linear Checklist*

* **The Debt Rule:**  Every linear variable defined must be consumed exactly once.  
* **The Consumption Rule:**  Once a variable is passed into a function, it is "gone." You must use the return value if you wish to continue using that resource.  
* **The Conditional Rule (**  **if**  **statements):**  
* A linear variable must be used in  **every**  branch of a conditional.  
* If you consume a variable in the true branch, you  **must**  also consume it in the else branch.  
* If there is no else branch, you cannot consume a linear variable inside the if block, as its consumption would be uncertain (0.5 uses).  
* **The Loop Rule:**  
* A linear variable defined  *outside*  a loop cannot be used  *inside*  the loop body.  
* Doing so would consume it in the first iteration, leaving it invalid for the second iteration (a double-use violation).  
* **The Goal:**  The compiler must be able to trace a single, unbroken line from the creation of the resource to its final, explicit destruction.

