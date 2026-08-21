import { DoubtFlow } from "@/components/shared/DoubtFlow";

export const metadata = {
  title: "Ask a Doubt — ShikshaSetu AI",
  description: "Get AI-powered answers to your Science doubts with source citations and mastery tracking.",
};

export default function AskPage() {
  return (
    <DoubtFlow
      mode="guest"
      initialMasteryScore={0}
      // onComplete is a no-op for guest — mastery delta is shown in the summary
      // but not persisted since guests don't have an account yet.
    />
  );
}
