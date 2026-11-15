import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"

import DrawingNames from "@/components/content/DrawingNames.vue"
import { Person } from "@/class/personClass"

const componentStubs = {
    "v-row": { template: "<div><slot /></div>" },
    "v-col": { template: "<div><slot /></div>" },
    "v-progress-linear": true,
    "v-card-actions": { template: "<div><slot /></div>" },
    "v-spacer": { template: "<span />" },
    "v-btn": { template: "<button><slot /></button>" }
}

function createWrapper (peopleAttending = []) {
    return mount(DrawingNames, {
        plugins: [
            createTestingPinia({
                createSpy: vi.fn,
                stubActions: false,
                initialState: { peopleAttending: { peopleAttending } }
            })
        ],
        global: { stubs: componentStubs }
    })
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("DrawingNames", () => {
    it("draws every name once without assigning anyone their own name", () => {
        const people = [new Person("Jon"), new Person("Jane"), new Person("Danny")]
        vi.spyOn(Math, "random")
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.34)
            .mockReturnValueOnce(0)

        const wrapper = createWrapper(people)

        const drawnNames = people.map((person) => person.nameDrawn)
        expect(drawnNames).toHaveLength(people.length)
        expect(new Set(drawnNames).size).toBe(people.length)
        people.forEach((person) => expect(person.nameDrawn).not.toBe(person.name))
        expect(wrapper.emitted("goToDifferentPage")).toEqual([["continue"]])
    })

    it("shows drawing progress and emits goBack when requested", async () => {
        const people = [new Person("Jon"), new Person("Jane")]
        vi.spyOn(Math, "random")
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.75)
        const wrapper = createWrapper(people)
        await wrapper.vm.$nextTick()

        expect(wrapper.text()).toContain("2 out of 2 names drawn")
        await wrapper.find("#go-back-button").trigger("click")

        expect(wrapper.emitted("goToDifferentPage")).toEqual([["continue"], ["goBack"]])
    })

    it("returns an error for an invalid navigation direction", () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const wrapper = createWrapper()

        expect(wrapper.vm.goToDifferentPage("badDirection")).toBe("Error in DrawingNames: badDirection is invalid")
    })
})