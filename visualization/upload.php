<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
$heights=explode(',', $_POST["heights"]);
if ($_FILES['upload']) {
    $targetDir = "uploads/";
    $allowTypes = array('jpg','png','jpeg','gif');
    if(!empty(array_filter($_FILES['upload']['name']))){
        foreach($_FILES['upload']['name'] as $key=>$val){
            $fileName = basename($_FILES['upload']['name'][$key]);
            $targetFilePath = $targetDir .time(). $fileName;
			$fileType = pathinfo($targetFilePath,PATHINFO_EXTENSION);
            if(in_array($fileType, $allowTypes)){
                if(move_uploaded_file($_FILES["upload"]["tmp_name"][$key], $targetFilePath)){
					$okFiles.='{"url":"http://bitcoins.bplaced.net/bachelor-thesis/'.$targetFilePath.'","height":'.intval(floatval($heights[$key])*100).'},';
				}
				else{
					$errorFiles.='{"name":'.$fileName.',"reason":'.$_FILES["upload"]["error"][$key].'},';
				}
			}
        }
	}
	echo '{"success": true,"okFiles":['.substr($okFiles, 0, -1).'],"errorFiles":['.substr($errorFiles, 0, -1).']}';
}else{
	echo '{"success": false}';
}
?>