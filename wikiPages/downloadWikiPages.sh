#!/bin/bash

wiki_pages=(
    "en_PhiloBiblonViewer_Index" "en_Welcome" "en_Search" "en_Beta" "en_Bipa" "en_Bitagap" "en_Biteca" "en_Help" "en_Resources" "en_About" "en_Citation" "en_Language" "en_Statistics" "en_Webversion" "en_Windowsversion" "en_History" "en_Acknowledgments" "en_Copyright"
    "es_PhiloBiblonViewer_Index" "es_Welcome" "es_Search" "es_Beta" "es_Bipa" "es_Bitagap" "es_Biteca" "es_Help" "es_Resources" "es_About" "es_Citation" "es_Language" "es_Statistics" "es_Webversion" "es_Windowsversion" "es_History" "es_Acknowledgments" "es_Copyright"
    "ca_PhiloBiblonViewer_Index" "ca_Welcome" "ca_Search" "ca_Beta" "ca_Bipa" "ca_Bitagap" "ca_Biteca" "ca_Help" "ca_Resources" "ca_About" "ca_Citation" "ca_Language" "ca_Statistics" "ca_Webversion" "ca_Windowsversion" "ca_History" "ca_Acknowledgments" "ca_Copyright"
    "gl_PhiloBiblonViewer_Index" "gl_Welcome" "gl_Search" "gl_Beta" "gl_Bipa" "gl_Bitagap" "gl_Biteca" "gl_Help" "gl_Resources" "gl_About" "gl_Citation" "gl_Language" "gl_Statistics" "gl_Webversion" "gl_Windowsversion" "gl_History" "gl_Acknowledgments" "gl_Copyright"
    "pt_PhiloBiblonViewer_Index" "pt_Welcome" "pt_Search" "pt_Beta" "pt_Bipa" "pt_Bitagap" "pt_Biteca" "pt_Help" "pt_Resources" "pt_About" "pt_Citation" "pt_Language" "pt_Statistics" "pt_Webversion" "pt_Windowsversion" "pt_History" "pt_Acknowledgments" "pt_Copyright"
    "Ui_SortedProperties"
)

for wiki_page in "${wiki_pages[@]}"; do
    echo "Downloading ${wiki_page} .."
    curl -s "https://philobiblon.cog.berkeley.edu/w/api.php?action=parse&page=${wiki_page}&prop=wikitext&format=json" | jq -r '.parse.wikitext["*"]' > $wiki_page
done

echo "done."
