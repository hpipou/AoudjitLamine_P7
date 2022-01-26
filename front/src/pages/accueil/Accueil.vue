<template>
    <div>
        <Nav/>
        <CreatePost/>
        <Posts/>
    </div>
</template>
<script>
    import Nav from "../layout/Nav";
    import CreatePost from "./CreatePost";
    import Posts from "./Posts"
    export default {
        name: 'Accueil',
        components: {
            Nav,
            CreatePost,
            Posts
        }
    }
</script>
