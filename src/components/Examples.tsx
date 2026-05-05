import { FileCode, BookOpen, Zap, Shield, Cpu, Binary } from 'lucide-react';
import CodeBlock from './CodeBlock';

const ExampleSection = ({ title, description, icon: Icon, files }: { title: string; description: string; icon: any; files: { filename: string; content: string }[] }) => (
  <div className="mb-20 animate__animated animate__fadeIn">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-austral-accent/10 flex items-center justify-center text-austral-accent">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-heading font-bold text-white">{title}</h2>
        <p className="text-austral-text-muted">{description}</p>
      </div>
    </div>
    
    <div className="grid lg:grid-cols-2 gap-6">
      {files.map((file, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-austral-surface border border-austral-border rounded-t-xl border-b-0 w-fit text-xs font-mono text-austral-accent">
            <FileCode size={14} />
            {file.filename}
          </div>
          <CodeBlock language="austral" code={file.content} filename={file.filename} />
        </div>
      ))}
    </div>
  </div>
);

export default function Examples() {
  const examples = [
    {
      title: "Hello World",
      description: "The classic introduction to any language. Demonstrates basic module structure and console output.",
      icon: Zap,
      files: [
        {
          filename: "Hello.aui",
          content: "module Hello is\n    function main(): Unit;\nend module."
        },
        {
          filename: "Hello.aum",
          content: "module body Hello is\n    function main(): Unit is\n        print(\"Hello, world!\");\n        return nil;\n    end;\nend module body."
        }
      ]
    },
    {
      title: "Foreign Function Interface (FFI)",
      description: "Interacting with C code. Demonstrates unsafe modules and pragma usage for external imports.",
      icon: Cpu,
      files: [
        {
          filename: "FFI.aui",
          content: "module FFI is\n    function puts(str: Address[Nat8]): Int32;\nend module."
        },
        {
          filename: "FFI.aum",
          content: "pragma Unsafe_Module;\n\nmodule body FFI is\n    pragma Foreign_Import(External_Name => \"puts\");\n    function puts(str: Address[Nat8]): Int32;\nend module body."
        }
      ]
    },
    {
      title: "Manual Memory Management",
      description: "Safe manual allocation and deallocation using linear types and the Address type.",
      icon: Shield,
      files: [
        {
          filename: "Memory.aui",
          content: "import Austral.Memory (Address);\n\nmodule Memory is\n    function testAllocation(): Unit;\nend module."
        },
        {
          filename: "Memory.aum",
          content: "import Austral.Memory (Address, allocate, deallocate);\n\nmodule body Memory is\n    function testAllocation(): Unit is\n        let ptr: Address[Int32] := allocate(1);\n        -- ... use pointer ...\n        deallocate(ptr);\n        return nil;\n    end;\nend module body."
        }
      ]
    },
    {
      title: "Algebraic Data Types (Unions)",
      description: "Exhaustive pattern matching with unions. This example shows an Option-like result type.",
      icon: Binary,
      files: [
        {
          filename: "Result.aui",
          content: "union Result[T: Free]: Free is\n    case Success is\n        value: T;\n    case Error is\n        message: String;\nend;\n\nmodule ResultExample is\n    function check(val: Int32): Result[Int32];\nend module."
        },
        {
          filename: "Result.aum",
          content: "module body ResultExample is\n    function check(val: Int32): Result[Int32] is\n        if val > 0 then\n            return Success(value => val);\n        else\n            return Error(message => \"Value must be positive\");\n        end if;\n    end;\nend module body."
        }
      ]
    },
    {
      title: "Haversine Distance",
      description: "Mathematical computation using records and constants to calculate distances between coordinates.",
      icon: BookOpen,
      files: [
        {
          filename: "Geo.aui",
          content: "record Point: Free is\n    lat: Float64;\n    lon: Float64;\nend;\n\nmodule Geo is\n    function haversine(p1: Point, p2: Point): Float64;\nend module."
        },
        {
          filename: "Geo.aum",
          content: "module body Geo is\n    constant R: Float64 := 6371.0;\n\n    function haversine(p1: Point, p2: Point): Float64 is\n        -- complex trig logic here\n        return 0.0; -- placeholder\n    end;\nend module body."
        }
      ]
    }
  ];

  return (
    <div className="flex-1 min-w-0 pb-24 pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6 tracking-tight">
          Austral <span className="bg-gradient-to-r from-austral-accent via-austral-accent-2 to-austral-accent-3 bg-clip-text text-transparent">Examples</span>
        </h1>
        <p className="text-xl text-austral-text-muted max-w-2xl mx-auto">
          Explore real-world code snippets demonstrating the power of linear types, capability-based security, and formal modularity.
        </p>
      </div>

      <div className="space-y-8">
        {examples.map((ex, i) => (
          <ExampleSection key={i} {...ex} />
        ))}
      </div>
    </div>
  );
}
