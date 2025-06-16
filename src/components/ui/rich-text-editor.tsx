"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Table as TableIcon,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MenuButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "rounded p-1.5 transition-colors",
      active
        ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100",
      disabled && "cursor-not-allowed opacity-50",
    )}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR warning
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
          "prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
          "prose-p:text-gray-700 dark:prose-p:text-gray-300",
          "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
          "prose-ul:list-disc prose-ol:list-decimal",
          "prose-li:text-gray-700 dark:prose-li:text-gray-300",
          "prose-table:border-collapse prose-table:border prose-table:border-gray-300",
          "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2",
          "prose-td:border prose-td:border-gray-300 prose-td:p-2",
          disabled && "cursor-not-allowed opacity-50",
        ),
      },
    },
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className={cn("rounded-lg border border-gray-300", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 p-2">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            disabled={disabled}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            disabled={disabled}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            disabled={disabled}
            title="Sublinhado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
            disabled={disabled}
            title="Realçar"
          >
            <Highlighter className="h-4 w-4" />
          </MenuButton>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            disabled={disabled}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            disabled={disabled}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            disabled={disabled}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Table */}
        <MenuButton
          onClick={addTable}
          disabled={disabled}
          title="Inserir tabela"
        >
          <TableIcon className="h-4 w-4" />
        </MenuButton>

        <div className="h-6 w-px bg-gray-300" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent editor={editor} />
        {!content && placeholder && (
          <div className="pointer-events-none absolute left-4 top-4 text-gray-400">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
