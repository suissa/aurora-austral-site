# Language Evolution Proposals: Closing the FFI Trust Gap

Following a comprehensive critique of the Austral specification, we have identified a critical paradox in the current design: while the language is built on the premise that human discernment is unreliable, the **Foreign Function Interface (FFI)** relies almost entirely on the programmer's ability to manually structure raw memory safely.

To resolve this, we propose the following language-level evolutions.

## 1. Formalizing the "Safe Wrapper" Pragma

### Problem
Currently, wrapping a C handle in a linear type is a manual convention. There is no mechanical enforcement that a `Foreign_Import` symbol must be encapsulated.

### Proposal
Introduce a `pragma Encapsulate` or similar mechanism that links a foreign function to a specific linear type and a "constructor" function.

```austral
pragma Foreign_Import(External_Name => "malloc");
function c_malloc(size: SizeT): Address[Nat8];

-- New Proposal: Linking the raw call to the safe wrapper
pragma Encapsulate(
    Function => c_malloc,
    Into => Buffer,
    Via => allocate_buffer
);
```

**Why:** This makes the intention of the FFI boundary explicit to the compiler, allowing for better linting and potentially automated generation of boilerplate safety checks (like null-pointer validation).

## 2. Linear-to-Raw Memory Barriers

### Problem
When a programmer needs to pass the internal pointer of a linear record to a C function (e.g., `memmove`), they must destructure the record. If they make a mistake in the `unsafe` block, they might accidentally leak the pointer or keep a reference to it after the linear record is consumed.

### Proposal
Introduce a `barrier` statement for unsafe blocks that allows temporary access to the raw pointer of a linear type without fully destructuring it, ensuring the linear type is "re-assembled" or "consumed" correctly.

```austral
borrow resource as ptr in unsafe
    -- Access raw 'ptr' for C call
    c_write(ptr, buffer);
end borrow;
```

**Why:** This prevents the "accidental leak" during manual destructuring. It provides a "safe tunnel" through the unsafe boundary.

## 3. Explicit Null-Safety for Foreign Returns

### Problem
C functions often return `NULL` to signify failure. In Austral, this is currently handled by manual `is_null` checks.

### Proposal
Allow `pragma Foreign_Import` to specify that a return value should be automatically converted into an `Option` or `Result` based on a nullity check.

```austral
pragma Foreign_Import(
    External_Name => "fopen",
    Null_Is_Failure => true
);
function c_fopen(path: Address[Nat8]): Option[Address[Nat8]];
```

**Why:** It moves the most common FFI error (forgetting the null check) from the human domain to the compiler domain.

## 4. FFI Design Patterns Library

The language should ship with a standard set of "FFI Patterns" (analogous to Rust's `std::ffi` but focused on Linearity):
- **Owned Pointer Pattern:** For resources that C allocates and we must free.
- **Borrowed Context Pattern:** For resources that C manages but we access.
- **Callback Barrier Pattern:** For passing Austral functions to C.

---

### Conclusion
By implementing these changes, Austral moves from "describing a titatium vault door with loose C hinges" to providing a **complete, hermetically sealed airlock** for foreign code. We transform the FFI from a "zone of danger" into a "governed transition."
