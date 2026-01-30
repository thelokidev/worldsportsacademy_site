"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Do I need to bring my own equipment?",
        answer: "For your first few sessions, we provide all necessary equipment including rackets, bats, and balls. As you progress, our coaches can recommend the best gear for your style of play if you wish to purchase your own."
    },
    {
        question: "Is there parking available at the academy?",
        answer: "Yes, we have ample free parking available for all members and guests directly in front of the facility."
    },
    {
        question: "What should I wear to my first session?",
        answer: "Wear comfortable athletic clothing and non-marking indoor court shoes."
    },
    {
        question: "Do you offer trial sessions?",
        answer: "Absolutely! We offer a Drop-in Session for new visitors to experience our facilities and meet our coaches before committing to a membership."
    },
    {
        question: "What is your cancellation policy?",
        answer: "We require 24 hours notice for cancellation of private sessions. Group classes can be cancelled up to 4 hours in advance without penalty."
    },
    {
        question: "Are there programs for children?",
        answer: "Yes, we have specialized junior development programs for ages 6-18, ranging from introductory fun classes to elite competitive training."
    }
];

export function FAQSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black border-t border-white/10">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-400">
                        Everything you need to know about training with us.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-white/10 rounded-xl px-6 bg-white/5 data-[state=open]:bg-white/10 transition-all duration-200"
                        >
                            <AccordionTrigger className="text-white hover:text-[#50C878] hover:no-underline text-left py-6 text-lg font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-300 pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
