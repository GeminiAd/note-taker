/*
 *  This is just a class for generating a unique ID for notes. I considered using packages like crypto for crypto.randomUUID() or
 *  using the UUID npm package, but that seems like too much for just this simple application. I'm only going to be saving, maybe
 *  100 notes? All I need for a unique ID generator is something that pops out sequential integers starting at 1 or 0, so that is 
 *  all this class does.
 */
class UID {
    /* Private variable we will use to generate IDs. */
    #counter;

    /* All we need to do in the constructor is set the counter to 1. */
    constructor() {
        this.#counter = 1;
    }

    /* 
     *  Returns the next unique ID. This function really just returns #counter and then increments it by 1.
     *
     *  @returns {number}: An integer representing the next unique ID.
     */
    getNextID() {
        /* 
         * The postfix ++ operator returns the value BEFORE incrementing the value, so this statement is the equivalent of 
         * returning the value of #counter AND THEN incrementing #counter.
         */
        return this.#counter++;
    }
}

module.exports = UID;