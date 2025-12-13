"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Heading1, Heading2, Link as LinkIcon, List, ListOrdered, Image as ImageIcon } from "lucide-react";

type Props = {
    name: string;
    defaultValue?: string;
    placeholder?: string;
};

export default function MarkdownEditor({ name, defaultValue = "", placeholder = "Write your story here..." }: Props) {
    const [value, setValue] = useState(defaultValue);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const insert = (prefix: string, suffix: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const { selectionStart, selectionEnd } = textarea;
        const selected = textarea.value.slice(selectionStart, selectionEnd);
        const nextValue = textarea.value.slice(0, selectionStart) + prefix + selected + suffix + textarea.value.slice(selectionEnd);
        setValue(nextValue);
        const cursor = selectionStart + prefix.length + selected.length + suffix.length;
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(cursor, cursor);
        });
    };

    const handleLink = () => {
        const url = window.prompt("Enter URL");
        if (!url) return;
        insert("[text](", `${url})`);
    };

    const handleImage = () => {
        const url = window.prompt("Enter image URL");
        if (!url) return;
        insert("![alt text](", `${url})`);
    };

    return (
        <div className="border rounded-md overflow-hidden bg-white">
            <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
                <ToolbarButton icon={<Heading1 className="h-4 w-4" />} label="H1" onClick={() => insert("# ")} />
                <ToolbarButton icon={<Heading2 className="h-4 w-4" />} label="H2" onClick={() => insert("## ")} />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton icon={<Bold className="h-4 w-4" />} label="Bold" onClick={() => insert("**", "**")} />
                <ToolbarButton icon={<Italic className="h-4 w-4" />} label="Italic" onClick={() => insert("*", "*")} />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton icon={<List className="h-4 w-4" />} label="Bullet" onClick={() => insert("- ")} />
                <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} label="Numbered" onClick={() => insert("1. ")} />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton icon={<LinkIcon className="h-4 w-4" />} label="Link" onClick={handleLink} />
                <ToolbarButton icon={<ImageIcon className="h-4 w-4" />} label="Image" onClick={handleImage} />
                <div className="ml-auto text-xs text-gray-500 px-2 py-1">
                    {value.trim().length} chars
                </div>
            </div>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[260px] p-3 focus:outline-none"
            />
        </div>
    );
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded"
            aria-label={label}
            title={label}
        >
            {icon}
        </button>
    );
}
