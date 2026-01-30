"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
}>({})

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        type?: "single" | "multiple"
        collapsible?: boolean
        value?: string
        onValueChange?: (value: string) => void
    }
>(({ className, type, value, onValueChange, collapsible, ...props }, ref) => {
    const [stateValue, setStateValue] = React.useState<string | undefined>(value)

    const handleValueChange = (newValue: string) => {
        const nextValue = stateValue === newValue ? "" : newValue
        setStateValue(nextValue)
        onValueChange?.(nextValue)
    }

    return (
        <AccordionContext.Provider value={{ value: stateValue, onValueChange: handleValueChange }}>
            <div ref={ref} className={className} {...props} />
        </AccordionContext.Provider>
    )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(AccordionContext)
    // Find the parent item value
    // This is a simplified implementation, ideally we'd use context for item value too
    // But for now we rely on the user passing the correct structure or we infer it if we could
    // Actually, we need the item value here to know if we are open.
    // Let's assume the parent AccordionItem passes context or we just check the data-value of parent?
    // To keep it simple and compatible with the usage in faq-section:
    // <AccordionItem value="..."> <AccordionTrigger> ...

    // We need a context for Item to pass its value to Trigger and Content
    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={(e) => {
                    const item = e.currentTarget.closest('[data-value]') as HTMLElement
                    if (item && onValueChange) {
                        onValueChange(item.dataset.value || "")
                    }
                    props.onClick?.(e)
                }}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { value } = React.useContext(AccordionContext)
    // We need to know our item's value. 
    // In this simple implementation, we can use a ref or just render always but hide?
    // Or better: Wrap Item in a Context.

    return (
        <AccordionItemContext.Consumer>
            {(itemValue) => {
                const isOpen = value === itemValue
                if (!isOpen) return null
                return (
                    <div
                        ref={ref}
                        className={cn(
                            "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
                            className
                        )}
                        {...props}
                    >
                        <div className="pb-4 pt-0">{children}</div>
                    </div>
                )
            }}
        </AccordionItemContext.Consumer>
    )
})
AccordionContent.displayName = "AccordionContent"

// Helper context for Item
const AccordionItemContext = React.createContext<string>("")

// Re-implement AccordionItem to provide context
const AccordionItemWrapper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={value}>
        <div ref={ref} className={cn("border-b", className)} data-value={value} {...props}>
            {children}
        </div>
    </AccordionItemContext.Provider>
))
AccordionItemWrapper.displayName = "AccordionItem"

export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent }
