<script setup>
import { onMounted } from "vue";
import auth from "../../utils/auth";
import {useRouter} from "vue-router";

const route = useRouter();

onMounted( async () => {
  const query = route.currentRoute.value.query??{};
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = query;

  await auth.step3(oauthToken, oauthVerifier);
})
</script>