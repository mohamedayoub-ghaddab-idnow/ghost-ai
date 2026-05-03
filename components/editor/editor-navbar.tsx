"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: Readonly<EditorNavbarProps>) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-bg-surface border-b border-border-default">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Center section */}
        <div className="flex items-center" />

        {/* Right section */}
        <div className="flex items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonTrigger: "focus:shadow-none",
                userButtonPopoverCard: "bg-bg-elevated border border-border-default rounded-2xl",
                userButtonPopoverActionButton: "text-text-primary hover:bg-bg-subtle rounded-xl",
                userButtonPopoverActionButtonText: "text-text-primary",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
