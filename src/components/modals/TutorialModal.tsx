import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface TutorialModalProps {
  onClose: () => void;
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  return (
    <Modal
      title="How Devdle works"
      subtitle="Daily puzzles for devs"
      icon="+"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        <p className="text-text-secondary">
          A new set of six coding problems is generated every 24 hours. Solve them in your
          browser. Keep your streak alive.
        </p>

        <Step number={1} title="Pick a problem">
          <p className="text-text-secondary">
            Three languages, two difficulties each. Beginner takes ~5 min; advanced takes
            the whole coffee.
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {[".js", ".py", ".rb"].map((ext) => (
              <span
                key={ext}
                className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-border text-text-secondary"
              >
                {ext}
              </span>
            ))}
            <span className="text-xs text-text-secondary">beginner / advanced</span>
          </div>
        </Step>

        <Step number={2} title={<>Write <code className="bg-border px-1 rounded text-xs font-mono">solve()</code></>}>
          <p className="text-text-secondary">
            Implement the{" "}
            <code className="bg-border px-1 rounded text-xs font-mono">solve()</code>{" "}
            function. Runs entirely in your browser — no servers, no signup.
          </p>
          <pre className="mt-1.5 text-xs bg-bg rounded p-2.5 border border-border text-text-secondary overflow-x-auto font-mono leading-relaxed">
            {`function solve(items) {\n  // your code here\n}`}
          </pre>
        </Step>

        <Step number={3} title="Run the tests">
          <p className="text-text-secondary">
            Press{" "}
            <kbd className="bg-border px-1 py-0.5 rounded text-xs font-mono">⌘ + ↵</kbd>{" "}
            to run. See each test by name, pass or fail — not the inputs.
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-success">
              <span className="font-bold">✓</span>
              <span>handles empty array</span>
              <span className="ml-auto text-text-secondary">0.4ms</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-error">
              <span className="font-bold">✗</span>
              <span>sum of floats and ints</span>
              <span className="ml-auto text-text-secondary">0.5ms</span>
            </div>
          </div>
        </Step>
      </div>
    </Modal>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold shrink-0">
          {number}
        </span>
        <span className="font-medium text-text-primary">{title}</span>
      </div>
      <div className="pl-7 space-y-1">{children}</div>
    </div>
  );
}
