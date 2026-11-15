import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"

import PeopleExchangingGifts from "@/components/content/PeopleExchangingGifts.vue"

const componentStubs = {
    "v-col": { template: "<div><slot /></div>" },
    "v-row": { template: "<div><slot /></div>" },
    "v-card-actions": { template: "<div><slot /></div>" },
    "v-spacer": { template: "<span />" },
    "v-btn": { template: "<button><slot /></button>" }
}

function createWrapper (peopleAttending = []) {
    return mount(PeopleExchangingGifts, {
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

describe("PeopleExchangingGifts", () => {
    it("clears the attendees and emits continue when starting another exchange", async () => {
        const people = [{ name: "Jon", edit: false, editName: "Jon", nameDrawn: "Jane" }]
        const wrapper = createWrapper(people)

        await wrapper.find("#continue-button").trigger("click")

        expect(wrapper.vm.peopleAttending).toEqual([])
        expect(wrapper.emitted("goToDifferentPage")).toEqual([["continue"]])
    })

    it("preserves attendees when navigating back", async () => {
        const people = [{ name: "Jon", edit: false, editName: "Jon", nameDrawn: "Jane" }]
        const wrapper = createWrapper(people)

        await wrapper.find("#go-back-button").trigger("click")

        expect(wrapper.vm.peopleAttending).toHaveLength(1)
        expect(wrapper.emitted("goToDifferentPage")).toEqual([["goBack"]])
    })

    it("returns an error for an invalid navigation direction", () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const wrapper = createWrapper()

        expect(wrapper.vm.goToDifferentPage("badDirection")).toBe("Error in PeopleExchangingGifts: badDirection is invalid")
    })
})