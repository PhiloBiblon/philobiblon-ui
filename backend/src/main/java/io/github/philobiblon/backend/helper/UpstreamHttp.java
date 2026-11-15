package io.github.philobiblon.backend.helper;

/** Constants shared by the clients that call the upstream FactGrid endpoints (SPARQL and Wikibase API). */
public final class UpstreamHttp {

    public static final String USER_AGENT = "PhiloBiblon-UI/1.0 (+https://philobiblon.cog.berkeley.edu)";
    /** Path fragment of the redirect FactGrid's reputation check answers with instead of the data. */
    public static final String REPUTATION_CHALLENGE_PATH = "rep-pow-challenge";

    private UpstreamHttp() {
    }
}
